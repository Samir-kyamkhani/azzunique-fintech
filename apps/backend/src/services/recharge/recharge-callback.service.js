import crypto from 'node:crypto';
import { eq } from 'drizzle-orm';

import { rechargeDb as db } from '../../database/recharge/recharge-db.js';
import {
  rechargeTransactionTable,
  rechargeCallbackTable,
} from '../../models/recharge/index.js';

import {
  platformServiceProviderTable,
  serviceProviderTable,
} from '../../models/core/index.js';

import WalletService from '../wallet.service.js';
import CommissionEngine from '../../lib/commission.engine.js';
import MultiLevelCommission from '../../lib/multilevel-commission.engine.js';
import { ApiError } from '../../lib/ApiError.js';

class RechargeCallbackService {
  static async handle(payload) {
    const { status, yourtransid, opid, txnid, message } = payload;

    if (!['SUCCESS', 'FAIL'].includes(status.toUpperCase())) return;

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
        eq(
          platformServiceProviderTable.platformServiceId,
          txn.platformServiceId,
        ),
      )
      .limit(1);

    if (!providerRow) {
      throw ApiError.internal('Provider config not found for callback');
    }

    const expectedSecret = providerRow.config?.callbackSecret;

    // first we need to decode the secret from expectedSecret

    // 🔐 SECRET VALIDATION (PROVIDER-SPECIFIC)
    if (!expectedSecret || secret !== expectedSecret) {
      console.warn(
        `Invalid callback secret for txn ${txn.id} (${providerRow.providerCode})`,
      );
      return;
    }

    // 2️⃣ Idempotency guard
    if (txn.status === 'SUCCESS' || txn.status === 'FAILED') return;

    // 3️⃣ Store raw callback
    await db.insert(rechargeCallbackTable).values({
      id: crypto.randomUUID(),
      transactionId: txn.id,
      status: status.tpUpperCase(),
      providerTxnId: opid,
      message,
      rawPayload: payload,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    if (status === 'SUCCESS') {
      await this.handleSuccess(txn, { opid, txnid });
      return;
    }

    if (status === 'FAIL') {
      await this.handleFailure(txn, message);
    }
  }

  static async handleSuccess(txn, { opid, txnid }) {
    await db.transaction(async () => {
      await db
        .update(rechargeTransactionTable)
        .set({
          status: 'SUCCESS',
          providerTxnId: opid,
          referenceId: txnid,
          updatedAt: new Date(),
        })
        .where(eq(rechargeTransactionTable.id, txn.id));

      await CommissionEngine.calculateAndCredit({
        transaction: {
          id: txn.id,
          tenantId: txn.tenantId,
          platformServiceId: txn.platformServiceId,
          platformServiceFeatureId: txn.platformServiceFeatureId,
          amount: txn.amount,
        },
        user: { id: txn.userId, tenantId: txn.tenantId },
      });

      await MultiLevelCommission.process({
        transaction: txn,
        user: { id: txn.userId, tenantId: txn.tenantId },
      });
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

      await tx
        .update(rechargeTransactionTable)
        .set({
          status: 'FAILED',
          failureReason: message,
          updatedAt: new Date(),
        })
        .where(eq(rechargeTransactionTable.id, txn.id));

      await WalletService.creditWallet({
        walletId: lockedTxn.walletId,
        amount: lockedTxn.amount,
        transactionId: lockedTxn.id,
      });
    });
  }
}

export default RechargeCallbackService;
