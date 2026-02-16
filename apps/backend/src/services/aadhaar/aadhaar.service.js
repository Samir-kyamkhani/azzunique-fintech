import crypto from 'node:crypto';
import { eq, and } from 'drizzle-orm';

import { aadhaarDb as db } from '../../database/aadhaar/aadhaar-db.js';
import { aadhaarSessionTable } from '../../models/aadhaar/index.js';

import {
  usersKycTable,
  kycDocumentTable,
} from '../../models/core/index.js';

import { ApiError } from '../../lib/ApiError.js';
import { getAadhaarPlugin } from '../../plugin_registry/aadhaar/pluginRegistry.js';
import { encrypt } from '../../lib/lib.js';
import { buildTenantChain } from '../../lib/tenantHierarchy.util.js';
import { AADHAAR_SERVICE_CODE } from '../../config/constant.js';
import AadhaarRuntimeService from './aadhaarRuntime.service.js';
import WalletService from '../wallet.service.js';

class AadhaarService {
  /**
   * SEND OTP
   */
  static async sendOtp({ payload, actor }) {
    const { aadhaarNumber, idempotencyKey } = payload;

    const tenantChain = await buildTenantChain(actor.tenantId);

    // 2️⃣ Resolve service + provider
    const { service, provider } = await AadhaarRuntimeService.resolve({
      tenantChain,
      platformServiceCode: AADHAAR_SERVICE_CODE,
    });

    // Idempotency check
    const existing = await db
      .select()
      .from(aadhaarSessionTable)
      .where(
        and(
          eq(aadhaarSessionTable.tenantId, actor.tenantId),
          eq(aadhaarSessionTable.idempotencyKey, idempotencyKey),
        ),
      )
      .limit(1);

    if (existing.length) {
      return {
        sessionId: existing[0].id,
        status: existing[0].status,
        duplicate: true,
      };
    }

    const sessionId = crypto.randomUUID();

    // 4️⃣ Fetch MAIN wallet
    const [mainWallet] = await WalletService.getUserWallets(
      actor.id,
      actor.tenantId,
    ).then((w) => w.filter((x) => x.walletType === 'MAIN'));

    if (!mainWallet) {
      throw ApiError.notFound('Main wallet not found');
    }

    // 5️⃣ Debit wallet (BLOCKED FLOW)
    await WalletService.blockAmount({
      walletId: mainWallet.id,
      amount,
      transactionId,
      reference: `AADHAAR:${sessionId}:${actor.id}`,
    });

    const encrypted = encrypt(aadhaarNumber);

    const masked = `XXXX-XXXX-${aadhaarNumber.slice(-4)}`;

    const plugin = getAadhaarPlugin(provider.code, provider.config);

    const otpResponse = await plugin.sendOtp({ aadhaarNumber });

    await db.insert(aadhaarSessionTable).values({
      id: sessionId,
      tenantId: actor.tenantId,
      userId: actor.id,
      aadhaarNumberEncrypted: encrypted,
      maskedAadhaar: masked,
      idempotencyKey,
      platformServiceId: service.id,
      providerCode: provider.code,
      providerId: provider.providerId,
      providerConfig: provider.config,
      referenceId: otpResponse.referenceId,
      status: 'OTP_SENT',
      consentGivenAt: new Date(),
      consentIp: actor.ip || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return { sessionId, status: 'OTP_SENT' };
  }

  /**
   * VERIFY OTP
   */
  static async verifyOtp({ payload, actor }) {
    const { sessionId, otp } = payload;

    const [session] = await db
      .select()
      .from(aadhaarSessionTable)
      .where(eq(aadhaarSessionTable.id, sessionId))
      .limit(1);

    if (!session) {
      throw ApiError.notFound('Session not found');
    }

    if (session.status !== 'OTP_SENT') {
      throw ApiError.badRequest('Invalid session state');
    }

    const plugin = getAadhaarPlugin(
      session.providerCode,
      session.providerConfig,
    );

    const verifyResponse = await plugin.verifyOtp({
      referenceId: session.referenceId,
      otp,
    });

    await db.transaction(async (tx) => {
      // Update session
      await tx
        .update(aadhaarSessionTable)
        .set({
          status: 'PENDING', // final via callback
          updatedAt: new Date(),
        })
        .where(eq(aadhaarSessionTable.id, sessionId));

      // Insert document
      await tx.insert(kycDocumentTable).values({
        ownerType: 'USER',
        ownerId: actor.id,
        documentType: 'AADHAAR',
        documentUrl: 'API_VERIFIED',
        documentNumber: session.maskedAadhaar,
        rowResponse: verifyResponse,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Ensure users_kyc exists
      await tx
        .insert(usersKycTable)
        .values({
          userId: actor.id,
          verificationStatus: 'PENDING',
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .onDuplicateKeyUpdate({
          set: { updatedAt: new Date() },
        });
    });

    return { status: 'PENDING_VERIFICATION' };
  }
}

export default AadhaarService;
