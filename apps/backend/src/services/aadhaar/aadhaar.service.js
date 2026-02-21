import crypto from 'node:crypto';
import { eq } from 'drizzle-orm';
import { db } from '../../database/core/core-db.js';
import { platformServiceResolve } from '../../lib/platformServiceResolver.util.js';
import { getAadhaarPlugin } from '../../plugin_registry/aadhaar/pluginRegistry.js';
import { ApiError } from '../../lib/ApiError.js';
import { decrypt, encrypt, generateNumber } from '../../lib/lib.js';

import { aadhaarTransactionTable } from '../../models/aadhaar/index.js';

import { usersKycTable, kycDocumentTable } from '../../models/core/index.js';
import { buildTenantChain } from '../../lib/tenantHierarchy.util.js';
import { AADHAAR_SERVICE_CODE } from '../../config/constant.js';
import path from 'node:path';
import fs from 'fs';
import { PermissionsRegistry } from '../../lib/PermissionsRegistry.js';
class AadhaarService {
  static async sendOtp({ aadhaarNumber, actor }) {
    const tenantChain = await buildTenantChain(actor.tenantId);

    const { provider } = await platformServiceResolve({
      tenantChain,
      platformServiceCode: AADHAAR_SERVICE_CODE,
    });

    const permissions = actor._resolvedPermissions || [];

    if (
      provider.code === 'MANUAL_AADHAAR' &&
      !permissions.includes(PermissionsRegistry.SERVICES.AADHAAR.MANUAL_CREATE)
    ) {
      throw ApiError.forbidden('Manual Aadhaar access denied');
    }

    if (
      provider.code !== 'MANUAL_AADHAAR' &&
      !permissions.includes(PermissionsRegistry.SERVICES.AADHAAR.API_CREATE)
    ) {
      throw ApiError.forbidden('API Aadhaar access denied');
    }

    const plugin = getAadhaarPlugin(provider.code, provider.providerConfig);

    const response = await plugin.sendOtp({ aadhaarNumber });

    const masked = `XXXX-XXXX-${aadhaarNumber.slice(-4)}`;
    const encrypted = encrypt(aadhaarNumber);

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
        response.data.status !== 'SUCCESS' ? response.message : null,
      status: provider.code === 'MANUAL_AADHAAR' ? 'INITIATED' : 'OTP_SENT',
      attemptCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return {
      transactionId,
      referenceId: ref,
      mode: provider.code,
      status: provider.code === 'MANUAL_AADHAAR' ? 'MANUAL_FLOW' : 'OTP_SENT',
    };
  }

  static async verify({ transactionId, otp, formData, actor }) {
    const [txn] = await db
      .select()
      .from(aadhaarTransactionTable)
      .where(eq(aadhaarTransactionTable.id, transactionId))
      .limit(1);

    if (!txn) throw ApiError.notFound('Transaction not found');

    const permissions = actor._resolvedPermissions || [];

    if (
      txn.providerCode === 'MANUAL_AADHAAR' &&
      !permissions.includes(PermissionsRegistry.SERVICES.AADHAAR.MANUAL_CREATE)
    ) {
      throw ApiError.forbidden('Manual Aadhaar verify denied');
    }

    if (
      txn.providerCode !== 'MANUAL_AADHAAR' &&
      !permissions.includes(PermissionsRegistry.SERVICES.AADHAAR.API_CREATE)
    ) {
      throw ApiError.forbidden('API Aadhaar verify denied');
    }

    const plugin = getAadhaarPlugin(txn.providerCode, txn.providerConfig);

    let verifyResponse;

    if (txn.providerCode === 'MANUAL_AADHAAR') {
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
            txn.providerCode === 'MANUAL_AADHAAR'
              ? 'PENDING'
              : verifyResponse.data.status,
          providerResponse: verifyResponse.data,
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
            txn.providerCode === 'MANUAL_AADHAAR'
              ? 'PENDING'
              : verifyResponse.data.status,
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
              txn.providerCode === 'MANUAL_AADHAAR'
                ? 'PENDING'
                : verifyResponse.data.status,
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
        rowResponse: verifyResponse.data,
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

  static async decodeAndSave(base64String) {
    try {
      if (!base64String) {
        throw new Error('Photo data missing');
      }

      console.log('Full length:', base64String.length);

      // Remove data:image prefix
      let cleaned = base64String.replace(/data:image\/\w+;base64,/g, '');
      cleaned = cleaned.replace(/\s/g, '');

      while (cleaned.length % 4 !== 0) {
        cleaned += '=';
      }

      const encryptedBuffer = Buffer.from(cleaned, 'base64');

      console.log('Before decrypt:', encryptedBuffer.slice(0, 4));

      // 🔥 TEMPORARY DECRYPT BLOCK
      // Assuming IV is first 16 bytes
      const iv = encryptedBuffer.slice(0, 16);
      const encryptedData = encryptedBuffer.slice(16);

      const secretKey = process.env.BULKPE_SECRET_KEY; // must be 32 bytes

      console.log('Key length:', Buffer.from(secretKey).length);

      const key = Buffer.from(secretKey, 'utf8');

      const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);

      let decrypted = decipher.update(encryptedData);
      decrypted = Buffer.concat([decrypted, decipher.final()]);

      console.log('After decrypt:', decrypted.slice(0, 4));

      const fileName = `${crypto.randomUUID()}.png`;
      const uploadPath = path.join('uploads', fileName);

      fs.writeFileSync(uploadPath, decrypted);

      return {
        fileName,
        path: uploadPath,
      };
    } catch (error) {
      throw new Error('Photo decrypt failed: ' + error.message);
    }
  }
}

export default AadhaarService;
