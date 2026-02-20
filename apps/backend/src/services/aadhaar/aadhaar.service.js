import crypto from 'node:crypto';
import { eq } from 'drizzle-orm';

import { db } from '../../database/core/core-db.js';
import { platformServiceResolve } from '../../lib/platformServiceResolver.util.js';
import { getAadhaarPlugin } from '../../plugin_registry/aadhaar/pluginRegistry.js';
import { ApiError } from '../../lib/ApiError.js';
import { decrypt, encrypt } from '../../lib/lib.js';

import { aadhaarTransactionTable } from '../../models/aadhaar/index.js';

import { usersKycTable, kycDocumentTable } from '../../models/core/index.js';
import { buildTenantChain } from '../../lib/tenantHierarchy.util.js';
import { AADHAAR_SERVICE_CODE } from '../../config/constant.js';

class AadhaarService {
  static async sendOtp({ aadhaarNumber, actor }) {
    let providerCode;
    let providerConfig = null;

    const tenantChain = await buildTenantChain(actor.tenantId);

    try {
      const { provider } = await platformServiceResolve({
        tenantChain,
        platformServiceCode: AADHAAR_SERVICE_CODE,
      });

      providerCode = provider.code;
      providerConfig = provider.config;
    } catch (err) {
      providerCode = 'MANUAL_AADHAAR';
    }

    const plugin = getAadhaarPlugin(providerCode, providerConfig);

    const response = await plugin.sendOtp({ aadhaarNumber });

    const masked = `XXXX-XXXX-${aadhaarNumber.slice(-4)}`;
    const encrypted = encrypt(aadhaarNumber);

    const transactionId = crypto.randomUUID();

    await db.insert(aadhaarTransactionTable).values({
      id: transactionId,
      userId: actor.id,
      tenantId: actor.tenantId,
      usersKycId: null,
      maskedAadhaar: masked,
      aadhaarEncrypted: encrypted,
      referenceId: response.referenceId,
      providerCode,
      providerConfig,
      providerResponse: response.raw,
      status: providerCode === 'MANUAL_AADHAAR' ? 'INITIATED' : 'OTP_SENT',
      attemptCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return {
      transactionId,
      referenceId: response.referenceId,
      mode: providerCode,
      status: providerCode === 'MANUAL_AADHAAR' ? 'MANUAL_FLOW' : 'OTP_SENT',
    };
  }

  static async verify({ transactionId, otp, formData, actor }) {
    const [txn] = await db
      .select()
      .from(aadhaarTransactionTable)
      .where(eq(aadhaarTransactionTable.id, transactionId))
      .limit(1);

    if (!txn) throw ApiError.notFound('Transaction not found');

    const plugin = getAadhaarPlugin(txn.providerCode, txn.providerConfig);

    let verifyResponse;

    if (txn.providerCode === 'MANUAL') {
      const decrypted = decrypt(txn.aadhaarEncrypted);

      verifyResponse = await plugin.verifyOtp({
        aadhaarNumber: decrypted,
        formData,
      });
    } else {
      verifyResponse = await plugin.verifyOtp({
        referenceId: txn.referenceId,
        otp,
      });
    }

    await db.transaction(async (tx) => {
      // Update transaction
      await tx
        .update(aadhaarTransactionTable)
        .set({
          status:
            txn.providerCode === 'MANUAL_AADHAAR' ? 'INITIATED' : 'VERIFIED',
          providerResponse: verifyResponse.raw,
          updatedAt: new Date(),
        })
        .where(eq(aadhaarTransactionTable.id, transactionId));

      // Ensure users_kyc row exists
      const [existingKyc] = await tx
        .select()
        .from(usersKycTable)
        .where(eq(usersKycTable.userId, actor.id))
        .limit(1);

      let usersKycId;

      if (!existingKyc) {
        const newId = crypto.randomUUID();
        await tx.insert(usersKycTable).values({
          id: newId,
          userId: actor.id,
          verificationStatus: 'PENDING_REVIEW',
          aadhaarStatus:
            txn.providerCode === 'MANUAL_AADHAAR' ? 'PENDING' : 'SUCCESS',
          kycMode: txn.providerCode,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        usersKycId = newId;
      } else {
        usersKycId = existingKyc.id;

        await tx
          .update(usersKycTable)
          .set({
            aadhaarStatus:
              txn.providerCode === 'MANUAL_AADHAAR' ? 'PENDING' : 'SUCCESS',
            verificationStatus: 'PENDING_REVIEW',
            kycMode: txn.providerCode,
            updatedAt: new Date(),
          })
          .where(eq(usersKycTable.userId, actor.id));
      }

      // Insert document
      await tx.insert(kycDocumentTable).values({
        ownerType: 'USER',
        ownerId: actor.id,
        documentType: 'AADHAAR',
        platformCode: txn.providerCode,
        documentUrl:
          txn.providerCode === 'MANUAL_AADHAAR'
            ? formData.documentUrl
            : 'API_VERIFIED',
        documentNumber: txn.maskedAadhaar,
        rowResponse: verifyResponse.raw,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Link transaction to users_kyc
      await tx
        .update(aadhaarTransactionTable)
        .set({ usersKycId })
        .where(eq(aadhaarTransactionTable.id, transactionId));
    });

    return {
      status: 'SUBMITTED_FOR_REVIEW',
    };
  }
}

export default AadhaarService;
