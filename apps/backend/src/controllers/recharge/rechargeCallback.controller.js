import { rechargeDb as db } from '../../database/recharge/recharge-db.js';
import { eq } from 'drizzle-orm';

import {
  rechargeTransactionTable,
  rechargeCallbackTable,
} from '../../models/recharge/index.js';

import WalletService from '../../services/wallet.service.js';
import envConfig from '../../config/config.js';
import CommissionEngine from '../../lib/commission.engine.js';
import MultiLevelCommission from '../../lib/multilevel-commission.engine.js';

export const rechargeCallback = async (req, res) => {
  if (req.query.secret !== envConfig.callback.callbackSecret) {
    return res.status(403).json({ success: false });
  }

  const { status, yourtransid, opid, txnid, number, amount, message } =
    req.query;

  // 1️⃣ Always ACK first (provider requirement)
  res.json({ success: true });

  // 2️⃣ Find transaction
  const [txn] = await db
    .select()
    .from(rechargeTransactionTable)
    .where(eq(rechargeTransactionTable.id, yourtransid))
    .limit(1);

  if (!txn) return;

  // 3️⃣ Idempotency guard
  if (txn.status === 'SUCCESS' || txn.status === 'FAILED') return;

  // 4️⃣ Store callback raw
  await db.insert(rechargeCallbackTable).values({
    id: crypto.randomUUID(),
    transactionId: txn.id,
    status,
    providerTxnId: opid,
    message,
    rawPayload: req.query,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // 5️⃣ SUCCESS CASE
  if (status === 'SUCCESS') {
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
  }

  // 6️⃣ FAIL CASE → REFUND
  if (status === 'FAIL') {
    await db.transaction(async (tx) => {
      const [lockedTxn] = await tx
        .select()
        .from(rechargeTransactionTable)
        .where(eq(rechargeTransactionTable.id, txn.id))
        .forUpdate()
        .limit(1);

      if (lockedTxn.status !== 'PENDING') return;

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
};
