import crypto from 'node:crypto';
import { eq, and } from 'drizzle-orm';

import { rechargeDb as db } from '../../database/recharge/recharge-db.js';
import {
  rechargeTransactionTable,
  rechargeCallbackTable,
} from '../../models/recharge/index.js';

import {
  platformServiceProviderTable,
  serviceProviderTable,
  usersTable,
} from '../../models/core/index.js';

import WalletService from '../wallet.service.js';
import CommissionEngine from '../../lib/commission.engine.js';
import MultiLevelCommission from '../../lib/multilevel-commission.engine.js';
import { ApiError } from '../../lib/ApiError.js';
import { verifyHmac } from '../../lib/verifyHmac.utils.js';

class RechargeCallbackService {
  static async handle({ query, headers, ip, rawQuery }) {
    const { status, yourtransid, opid, txnid, message } = query;

    const finalStatus = status?.toUpperCase();
    if (!['SUCCESS', 'FAIL', 'FAILED'].includes(finalStatus)) return;

    const normalizedStatus = finalStatus === 'SUCCESS' ? 'SUCCESS' : 'FAILED';

    // 1️⃣ Find transaction
    const [txn] = await db
      .select()
      .from(rechargeTransactionTable)
      .where(eq(rechargeTransactionTable.id, yourtransid))
      .limit(1);

    if (!txn) return;

    // 2️⃣ Find provider + config
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
      .where(
        and(
          eq(
            platformServiceProviderTable.platformServiceId,
            txn.platformServiceId,
          ),
          eq(platformServiceProviderTable.serviceProviderId, txn.providerId),
        ),
      )
      .limit(1);

    if (!providerRow) {
      throw ApiError.internal('Provider config not found for callback');
    }

    const config = providerRow.config || {};

    // 4️⃣ IP allowlist
    if (Array.isArray(config.callbackIps) && config.callbackIps.length > 0) {
      if (!config.callbackIps.includes(ip)) {
        console.warn(`Blocked callback IP ${ip}`);
        return;
      }
    }

    if (!config.callbackSecret) {
      console.warn(
        `Callback secret missing for provider ${providerRow.providerCode}`,
      );
      return;
    }
    const secret = Buffer.from(config.callbackSecret, 'base64');

    const isValid = verifyHmac({
      rawQuery,
      headers,
      secret,
      algo: config.hmacAlgo || 'sha256',
    });

    if (!isValid) {
      console.warn('Invalid callback signature');
      return;
    }

    // 6️⃣ Replay attack guard
    const [alreadyProcessed] = await db
      .select({ id: rechargeCallbackTable.id })
      .from(rechargeCallbackTable)
      .where(
        and(
          eq(rechargeCallbackTable.transactionId, txn.id),
          eq(rechargeCallbackTable.providerTxnId, opid),
          eq(rechargeCallbackTable.status, normalizedStatus),
        ),
      )
      .limit(1);

    if (alreadyProcessed) return;

    // 2️⃣ Idempotency guard
    if (txn.status === 'SUCCESS' || txn.status === 'FAILED') return;

    // 3️⃣ Store raw callback
    try {
      await db.insert(rechargeCallbackTable).values({
        id: crypto.randomUUID(),
        transactionId: txn.id,
        status: normalizedStatus,
        providerTxnId: opid,
        message,
        rawPayload: query,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } catch (e) {
      return; // duplicate callback, safe exit
    }

    if (normalizedStatus === 'SUCCESS') {
      await this.handleSuccess(txn, { opid, txnid });
      return;
    }

    if (normalizedStatus === 'FAILED') {
      await this.handleFailure(txn, message);
    }
  }

  static async handleSuccess(txn, { opid, txnid }) {
    await db.transaction(async (tx) => {
      const [lockedTxn] = await tx
        .select()
        .from(rechargeTransactionTable)
        .where(eq(rechargeTransactionTable.id, txn.id))
        .forUpdate()
        .limit(1);

      // 🔐 IDENTITY + STATE GUARD
      if (!lockedTxn || lockedTxn.status !== 'PENDING') return;

      if (!lockedTxn.blockedAmount || lockedTxn.blockedAmount <= 0) {
        console.warn(
          '[RechargeCallback] Blocked amount missing on SUCCESS',
          lockedTxn.id,
        );
        return;
      }

      await tx
        .update(rechargeTransactionTable)
        .set({
          status: 'SUCCESS',
          providerTxnId: opid,
          referenceId: txnid,
          updatedAt: new Date(),
        })
        .where(eq(rechargeTransactionTable.id, txn.id));

      // 🔹 Fetch roleId if missing in txn
      let roleId = lockedTxn.roleId;
      if (!roleId) {
        const [userRow] = await db
          .select({ roleId: usersTable.roleId })
          .from(usersTable)
          .where(eq(usersTable.id, lockedTxn.userId))
          .limit(1);

        roleId = userRow?.roleId || null;
      }

      // CommissionEngine call with complete user object
      await CommissionEngine.calculateAndCredit({
        transaction: {
          id: txn.id,
          tenantId: txn.tenantId,
          platformServiceId: txn.platformServiceId,
          platformServiceFeatureId: txn.platformServiceFeatureId,
          amount: txn.amount,
        },
        user: {
          id: txn.userId,
          tenantId: txn.tenantId,
          roleId, // ✅ added
        },
      });

      await MultiLevelCommission.process({
        transaction: txn,
        user: {
          id: txn.userId,
          tenantId: txn.tenantId,
          roleId, // ✅ added
        },
      });

      // Debit blocked amount if exists
      if (lockedTxn.blockedAmount > 0) {
        await WalletService.debitBlockedAmount({
          walletId: lockedTxn.walletId,
          amount: lockedTxn.amount,
          transactionId: lockedTxn.id,
          reference: `RECHARGE_SUCCESS:${lockedTxn.id}`,
        });
      }
    });
  }

  static async handleFailure(txn, message) {
    await db.transaction(async (tx) => {
      const [lockedTxn] = await tx
        .select()
        .from(rechargeTransactionTable)
        .where(eq(rechargeTransactionTable.id, txn.id))
        .forUpdate()
        .limit(1);

      if (!lockedTxn || lockedTxn.status !== 'PENDING') return;

      if (!lockedTxn.blockedAmount || lockedTxn.blockedAmount <= 0) {
        console.warn(
          '[RechargeCallback] Blocked amount missing on FAILURE',
          lockedTxn.id,
        );
        return;
      }

      await tx
        .update(rechargeTransactionTable)
        .set({
          status: 'FAILED',
          failureReason: message,
          updatedAt: new Date(),
        })
        .where(eq(rechargeTransactionTable.id, txn.id));

      await WalletService.releaseBlockedAmount({
        walletId: lockedTxn.walletId,
        amount: lockedTxn.amount,
        transactionId: lockedTxn.id,
        reference: `RECHARGE_FAILURE:${lockedTxn.id}`,
      });
    });
  }
}

export default RechargeCallbackService;
