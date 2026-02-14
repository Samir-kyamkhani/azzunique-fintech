import crypto from 'node:crypto';
import { eq, and } from 'drizzle-orm';

import { aadhaarDb as db } from '../../database/aadhaar/aadhaar-db.js';
import { aadhaarSessionTable } from '../../models/aadhaar/index.js';

import { usersKycTable } from '../../models/core/usersKyc.schema.js';
import { kycDocumentTable } from '../../models/core/kycDocument.schema.js';

import { ApiError } from '../../lib/ApiError.js';
import { getKycPlugin } from '../../plugin_registry/kyc/pluginRegistry.js';
import { encrypt } from '../../lib/lib.js';

class AadhaarService {
  /**
   * SEND OTP
   */
  static async sendOtp({ payload, actor }) {
    const { aadhaarNumber, idempotencyKey } = payload;

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

    const encrypted = encrypt(aadhaarNumber);

    const masked = `XXXX-XXXX-${aadhaarNumber.slice(-4)}`;

    // TODO: Resolve provider properly from runtime service
    const plugin = getKycPlugin('AADHAAR', 'BULKPE', {});

    const otpResponse = await plugin.sendOtp({ aadhaarNumber });

    await db.insert(aadhaarSessionTable).values({
      id: sessionId,
      tenantId: actor.tenantId,
      userId: actor.id,
      aadhaarNumberEncrypted: encrypted,
      maskedAadhaar: masked,
      idempotencyKey,
      platformServiceId: 'AADHAAR_SERVICE',
      providerCode: 'BULKPE',
      providerId: 'STATIC_PROVIDER',
      providerConfig: {},
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

    const plugin = getKycPlugin(
      'AADHAAR',
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
