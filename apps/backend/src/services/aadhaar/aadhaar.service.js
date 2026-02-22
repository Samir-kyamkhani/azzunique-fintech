import crypto from 'node:crypto';
import { desc, eq } from 'drizzle-orm';
import { db } from '../../database/core/core-db.js';
import { platformServiceResolve } from '../../lib/platformServiceResolver.util.js';
import { getAadhaarPlugin } from '../../plugin_registry/aadhaar/pluginRegistry.js';
import { ApiError } from '../../lib/ApiError.js';
import { decrypt, encrypt, generateNumber } from '../../lib/lib.js';

import { aadhaarTransactionTable } from '../../models/aadhaar/index.js';

import { usersKycTable, kycDocumentTable } from '../../models/core/index.js';
import { buildTenantChain } from '../../lib/tenantHierarchy.util.js';
import { AADHAAR_SERVICE_CODE } from '../../config/constant.js';
import SurchargeEngine from '../../lib/surcharge.engine.js';

class AadhaarService {
  static async sendOtp({ aadhaarNumber, actor }) {
    const tenantChain = await buildTenantChain(actor.tenantId);

    const { service, provider } = await platformServiceResolve({
      tenantChain,
      platformServiceCode: AADHAAR_SERVICE_CODE,
    });

    const masked = `XXXX-XXXX-${aadhaarNumber.slice(-4)}`;
    const encrypted = encrypt(aadhaarNumber);

    // 🔎 Find latest transaction for this user
    const [existingTxn] = await db
      .select()
      .from(aadhaarTransactionTable)
      .where(eq(aadhaarTransactionTable.userId, actor.id))
      .orderBy(desc(aadhaarTransactionTable.createdAt))
      .limit(1);

    const now = new Date();

    if (existingTxn) {
      const isSameAadhaar = existingTxn.maskedAadhaar === masked;

      const isActiveStatus = ['INITIATED', 'OTP_SENT'].includes(
        existingTxn.status,
      );

      const isExpired = now - new Date(existingTxn.createdAt) > 10 * 60 * 1000; // 10 min expiry

      // 🚨 Already verified
      if (existingTxn.status === 'SUCCESS' && isSameAadhaar) {
        throw ApiError.conflict(
          'This Aadhaar is already verified for this account.',
        );
      }

      // 🔁 Same Aadhaar + Active + Not Expired
      if (isSameAadhaar && isActiveStatus && !isExpired) {
        if (existingTxn.attemptCount >= 3) {
          throw ApiError.badRequest('Maximum OTP attempts reached');
        }

        const plugin = getAadhaarPlugin(
          existingTxn.providerCode,
          existingTxn.providerConfig,
        );

        const response = await plugin.sendOtp({ aadhaarNumber });

        await db
          .update(aadhaarTransactionTable)
          .set({
            attemptCount: existingTxn.attemptCount + 1,
            providerResponse: response.raw,
            updatedAt: now,
          })
          .where(eq(aadhaarTransactionTable.id, existingTxn.id));

        return {
          transactionId: existingTxn.id,
          referenceId: existingTxn.referenceId,
          mode: existingTxn.providerCode,
          status:
            existingTxn.providerCode === 'MANUAL_AADHAAR'
              ? 'MANUAL_FLOW'
              : 'OTP_SENT',
          maskedAadhaar: masked,
        };
      }

      // 🧹 If expired OR different Aadhaar → allow new transaction
    }

    // 🆕 CREATE NEW TRANSACTION
    const transactionId = crypto.randomUUID();

    const transaction = {
      id: transactionId,
      tenantId: actor.tenantId,
      platformServiceId: service.id,
      platformServiceFeatureId: null,
      amount: 0,
    };

    const { finalAmount } = await SurchargeEngine.calculate({
      transaction,
      user: actor,
    });

    if (finalAmount > 0) {
      await WalletService.blockAmount({
        walletId: mainWallet.id,
        amount: finalAmount,
        transactionId,
        reference: `AADHAAR:${transactionId}`,
      });
    }

    const plugin = getAadhaarPlugin(provider.code, provider.providerConfig);

    const response = await plugin.sendOtp({ aadhaarNumber });

    const ref =
      provider.code === 'MANUAL_AADHAAR'
        ? generateNumber('REF', 4)
        : response.referenceId;

    await db.insert(aadhaarTransactionTable).values({
      id: transactionId,
      userId: actor.id,
      tenantId: actor.tenantId,
      usersKycId: null,
      maskedAadhaar: masked,
      aadhaarEncrypted: encrypted,
      referenceId: ref,
      providerCode: provider.code,
      providerConfig: provider.providerConfig,
      providerResponse: response.raw,
      failureReason:
        response?.data?.status !== 'SUCCESS' ? response.message : null,
      status: provider.code === 'MANUAL_AADHAAR' ? 'INITIATED' : 'OTP_SENT',
      attemptCount: 0,
      createdAt: now,
      updatedAt: now,
    });

    return {
      transactionId,
      referenceId: ref,
      mode: provider.code,
      status: provider.code === 'MANUAL_AADHAAR' ? 'MANUAL_FLOW' : 'OTP_SENT',
      maskedAadhaar: masked,
    };
  }

  static async verify({ transactionId, otp, formData, actor, files }) {
    const [txn] = await db
      .select()
      .from(aadhaarTransactionTable)
      .where(eq(aadhaarTransactionTable.id, transactionId))
      .limit(1);

    if (!txn) throw ApiError.notFound('Transaction not found');

    const isManual = txn.providerCode === 'MANUAL_AADHAAR';

    /* -------------------------------------------------- */
    /* 1️⃣ MANUAL FILE VALIDATION */
    /* -------------------------------------------------- */
    if (isManual) {
      if (!files?.profilePhoto?.[0]) {
        throw ApiError.badRequest('Profile photo is required');
      }

      if (!files?.aadhaarPhoto?.[0]) {
        throw ApiError.badRequest('Aadhaar photo is required');
      }

      if (!formData) {
        throw ApiError.badRequest('Form data is required');
      }

      // If formData came as string (multipart case)
      if (typeof formData === 'string') {
        try {
          formData = JSON.parse(formData);
        } catch {
          throw ApiError.badRequest('Invalid formData JSON');
        }
      }
    }

    /* -------------------------------------------------- */
    /* 2️⃣ LOAD PLUGIN */
    /* -------------------------------------------------- */
    const plugin = getAadhaarPlugin(txn.providerCode, txn.providerConfig);

    let verifyResponse;

    if (isManual) {
      const decrypted = decrypt(txn.aadhaarEncrypted);

      verifyResponse = await plugin.verifyOtp({
        aadhaarNumber: decrypted,
        formData,
        files, // if plugin needs it
      });
    } else {
      if (!otp) {
        throw ApiError.badRequest('OTP is required');
      }

      verifyResponse = await plugin.verifyOtp({
        referenceId: txn.referenceId,
        otp,
      });
    }

    const providerStatus = isManual
      ? 'SUCCESS'
      : verifyResponse?.data?.status || 'FAILED';

    /* -------------------------------------------------- */
    /* 3️⃣ DB TRANSACTION */
    /* -------------------------------------------------- */
    await db.transaction(async (tx) => {
      // Update Aadhaar transaction
      await tx
        .update(aadhaarTransactionTable)
        .set({
          status: providerStatus,
          providerResponse: verifyResponse?.data,
          updatedAt: new Date(),
        })
        .where(eq(aadhaarTransactionTable.id, transactionId));

      // Ensure users_kyc exists
      const [existingKyc] = await tx
        .select()
        .from(usersKycTable)
        .where(eq(usersKycTable.userId, actor.id))
        .limit(1);

      let usersKycId;

      if (!existingKyc) {
        usersKycId = crypto.randomUUID();

        await tx.insert(usersKycTable).values({
          id: usersKycId,
          userId: actor.id,
          verificationStatus: 'PENDING_REVIEW',
          aadhaarStatus: providerStatus,
          kycMode: txn.providerCode,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      } else {
        usersKycId = existingKyc.id;

        await tx
          .update(usersKycTable)
          .set({
            aadhaarStatus: providerStatus,
            verificationStatus: 'PENDING_REVIEW',
            kycMode: txn.providerCode,
            updatedAt: new Date(),
          })
          .where(eq(usersKycTable.userId, actor.id));
      }

      // Insert KYC document
      await tx.insert(kycDocumentTable).values({
        ownerType: 'USER',
        ownerId: actor.id,
        documentType: 'AADHAAR',
        platformCode: txn.providerCode,
        documentUrl: isManual ? 'MANUAL_UPLOAD_PENDING' : 'API_VERIFIED',
        documentNumber: txn.maskedAadhaar,
        rowResponse: verifyResponse?.data,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Link transaction
      await tx
        .update(aadhaarTransactionTable)
        .set({ usersKycId })
        .where(eq(aadhaarTransactionTable.id, transactionId));
    });

    return {
      status: 'SUBMITTED_FOR_REVIEW',
    };
  }

  static async getStatus(actor) {
    const [txn] = await db
      .select()
      .from(aadhaarTransactionTable)
      .where(eq(aadhaarTransactionTable.userId, actor.id))
      .orderBy(desc(aadhaarTransactionTable.createdAt))
      .limit(1);

    if (!txn) {
      return {
        status: 'NOT_STARTED',
      };
    }

    return {
      status: txn.status,
      transactionId: txn.id,
      maskedAadhaar: txn.maskedAadhaar,
      providerCode: txn.providerCode,
    };
  }
}

export default AadhaarService;
