import crypto from 'node:crypto';
import { eq, and } from 'drizzle-orm';

import { aadhaarDb as db } from '../../database/aadhaar/aadhaar-db.js';
import {
  aadhaarSessionTable,
  aadhaarCallbackTable,
} from '../../models/aadhaar/index.js';

import {
  platformServiceProviderTable,
  serviceProviderTable,
} from '../../models/core/index.js';

import { ApiError } from '../../lib/ApiError.js';
import { verifyHmac } from '../../lib/verifyHmac.utils.js';

class AadhaarCallbackService {
  static async handle({ body, query, headers, ip, rawBody }) {
    const payload = body && Object.keys(body).length ? body : query;

    if (!payload) return;

    const { status, referenceId, providerTxnId, message } = payload;

    if (!referenceId || !status) return;

    const finalStatus = status.toUpperCase();

    if (!['SUCCESS', 'FAIL', 'FAILED'].includes(finalStatus)) return;

    const normalizedStatus = finalStatus === 'SUCCESS' ? 'VERIFIED' : 'FAILED';

    // 🔹 Find session
    const [session] = await db
      .select()
      .from(aadhaarSessionTable)
      .where(eq(aadhaarSessionTable.referenceId, referenceId))
      .limit(1);

    if (!session) return;

    // 🔹 Fetch provider config
    const [providerRow] = await db
      .select({
        config: platformServiceProviderTable.config,
        providerCode: serviceProviderTable.code,
      })
      .from(platformServiceProviderTable)
      .leftJoin(
        serviceProviderTable,
        eq(
          serviceProviderTable.id,
          platformServiceProviderTable.serviceProviderId,
        ),
      )
      .where(eq(platformServiceProviderTable.id, session.providerId))
      .limit(1);

    if (!providerRow) {
      throw ApiError.internal('Provider config not found');
    }

    const config = providerRow.config || {};

    // 🔹 IP allowlist
    if (Array.isArray(config.callbackIps) && config.callbackIps.length > 0) {
      if (!config.callbackIps.includes(ip)) {
        console.warn('[Aadhaar] Blocked callback IP:', ip);
        return;
      }
    }

    // 🔹 Signature verification
    if (config.callbackSecret) {
      const secret = Buffer.from(config.callbackSecret, 'base64');

      const isValid = verifyHmac({
        rawQuery: rawBody,
        headers,
        secret,
        algo: config.hmacAlgo || 'sha256',
      });

      if (!isValid) {
        console.warn('[Aadhaar] Invalid callback signature');
        return;
      }
    }

    // 🔹 Replay guard
    const [alreadyProcessed] = await db
      .select({ id: aadhaarCallbackTable.id })
      .from(aadhaarCallbackTable)
      .where(
        and(
          eq(aadhaarCallbackTable.sessionId, session.id),
          eq(aadhaarCallbackTable.providerTxnId, providerTxnId || ''),
          eq(aadhaarCallbackTable.status, normalizedStatus),
        ),
      )
      .limit(1);

    if (alreadyProcessed) return;

    // 🔹 Idempotency guard
    if (['VERIFIED', 'FAILED'].includes(session.status)) return;

    // 🔹 Store callback safely
    await db.insert(aadhaarCallbackTable).values({
      id: crypto.randomUUID(),
      sessionId: session.id,
      providerTxnId: providerTxnId || '',
      status: normalizedStatus,
      message,
      rawPayload: payload,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    if (normalizedStatus === 'VERIFIED') {
      await this.handleSuccess(session, payload);
    } else {
      await this.handleFailure(session, message);
    }
  }

  static async handleSuccess(session, payload) {
    await db.transaction(async (tx) => {
      const [lockedSession] = await tx
        .select()
        .from(aadhaarSessionTable)
        .where(eq(aadhaarSessionTable.id, session.id))
        .forUpdate()
        .limit(1);

      if (!lockedSession || lockedSession.status !== 'PENDING') return;

      await tx
        .update(aadhaarSessionTable)
        .set({
          status: 'VERIFIED',
          responsePayload: payload,
          verifiedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(aadhaarSessionTable.id, session.id));

      // 🔥 OPTIONAL: update users_kyc table here if required
    });
  }

  static async handleFailure(session, message) {
    await db.transaction(async (tx) => {
      const [lockedSession] = await tx
        .select()
        .from(aadhaarSessionTable)
        .where(eq(aadhaarSessionTable.id, session.id))
        .forUpdate()
        .limit(1);

      if (!lockedSession || lockedSession.status !== 'PENDING') return;

      await tx
        .update(aadhaarSessionTable)
        .set({
          status: 'FAILED',
          failureReason: message,
          updatedAt: new Date(),
        })
        .where(eq(aadhaarSessionTable.id, session.id));
    });
  }
}

export default AadhaarCallbackService;
