import { rechargeDb as db } from '../../database/recharge/recharge-db.js';
import { rechargeTransactionTable } from '../../models/recharge/index.js';
import { and, eq, lte } from 'drizzle-orm';
import WalletService from '../wallet.service.js';
import CommissionReversalService from '../commission-reversal.service.js';
import { getRechargePlugin } from '../../plugin_registry/recharge/pluginRegistry.js';

class RechargeStatusService {
  /**
   * CRON ENTRY
   * Called every X minutes
   */
  async processPendingTransactions() {
    const pendingTxns = await db
      .select()
      .from(rechargeTransactionTable)
      .where(
        and(
          eq(rechargeTransactionTable.status, 'PENDING'),
          lte(rechargeTransactionTable.nextStatusCheckAt, new Date()),
        ),
      )
      .limit(50);

    for (const txn of pendingTxns) {
      try {
        await this.checkAndResolve(txn);
      } catch (err) {
        console.error(
          '[RechargeStatusService] check failed',
          txn.id,
          err.response?.data || err.message,
        );
      }
    }
  }

  async checkAndResolve(txn) {
    if (!txn.providerId || !txn.providerCode) {
      console.warn('[RechargeCron] Provider not frozen', txn.id);
      return;
    }

    const plugin = getRechargePlugin(txn.providerCode, txn.providerConfig);

    if (typeof plugin.checkStatus !== 'function') {
      return; // polling not supported
    }

    // 🔒 If providerTxnId missing → skip polling
    if (!txn.providerTxnId) {
      console.warn('[RechargeCron] Missing providerTxnId', txn.id);
      return;
    }

    let statusResp;

    try {
      statusResp = await plugin.checkStatus({
        transId: txn.id,
        providerTxnId: txn.providerTxnId,
      });
    } catch (err) {
      console.error('[RechargeCron] Provider 500', {
        txnId: txn.id,
        providerTxnId: txn.providerTxnId,
        message: err.response?.data || err.message,
      });

      return; // never crash cron
    }

    const providerStatus = String(statusResp?.status ?? '')
      .trim()
      .toUpperCase();

    // ⏳ Only skip if still pending
    if (providerStatus === 'PENDING') {
      // 🔥 STEP 5 — MAX POLL GUARD
      if (txn.pollAttempt >= 5) {
        console.warn('[RechargeCron] Max poll attempts reached', txn.id);

        await db.transaction(async (tx) => {
          await tx
            .update(rechargeTransactionTable)
            .set({
              status: 'FAILED',
              failureReason: 'Polling timeout',
              updatedAt: new Date(),
            })
            .where(eq(rechargeTransactionTable.id, txn.id));

          await WalletService.releaseBlockedAmount({
            walletId: txn.walletId,
            amount: txn.amount,
            transactionId: txn.id,
            reference: `RECHARGE_TIMEOUT:${txn.id}`,
          });
        });

        return;
      }

      // 🔁 EXPONENTIAL BACKOFF
      const nextAttempt = txn.pollAttempt + 1;
      const baseDelay = 5 * 60 * 1000; // 5 minutes
      const maxDelay = 60 * 60 * 1000; // 1 hour cap
      const nextDelay = Math.min(
        baseDelay * Math.pow(2, txn.pollAttempt),
        maxDelay,
      );
      await db
        .update(rechargeTransactionTable)
        .set({
          pollAttempt: nextAttempt,
          nextStatusCheckAt: new Date(Date.now() + nextDelay),
          updatedAt: new Date(),
        })
        .where(eq(rechargeTransactionTable.id, txn.id));

      console.log(
        `[RechargeCron] Still pending → next check in ${nextDelay / 60000} min`,
      );

      return;
    }

    await db.transaction(async (tx) => {
      const [lockedTxn] = await tx
        .select()
        .from(rechargeTransactionTable)
        .where(eq(rechargeTransactionTable.id, txn.id))
        .forUpdate()
        .limit(1);

      if (!lockedTxn || lockedTxn.status !== 'PENDING') {
        return;
      }

      // 🟢 SUCCESS
      if (providerStatus === 'SUCCESS') {
        await tx
          .update(rechargeTransactionTable)
          .set({
            status: 'SUCCESS',
            providerTxnId:
              lockedTxn.providerTxnId || statusResp.optransid || null,
            referenceId:
              lockedTxn.referenceId || statusResp.referenceid || null,
            updatedAt: new Date(),
          })
          .where(eq(rechargeTransactionTable.id, lockedTxn.id));

        return;
      }

      // 🔴 FAIL
      if (
        ['FAIL', 'FAILED', 'FAILURE', 'ERROR', 'REJECTED'].includes(
          providerStatus,
        )
      ) {
        if (!lockedTxn.blockedAmount || lockedTxn.blockedAmount <= 0) {
          console.warn('[RechargeCron] Blocked amount missing', lockedTxn.id);
          return;
        }

        // Refund wallet
        await WalletService.releaseBlockedAmount({
          walletId: lockedTxn.walletId,
          amount: lockedTxn.amount,
          transactionId: lockedTxn.id,
          reference: `RECHARGE_FAILURE:${lockedTxn.id}`,
        });

        // Reverse commission
        await CommissionReversalService.reverseByTransaction(lockedTxn.id);

        await tx
          .update(rechargeTransactionTable)
          .set({
            status: 'FAILED',
            failureReason: statusResp.message || 'Recharge failed (cron)',
            updatedAt: new Date(),
          })
          .where(eq(rechargeTransactionTable.id, lockedTxn.id));

        return;
      }

      // ⚠ Unknown status
      console.warn(
        '[RechargeCron] Unknown provider status',
        lockedTxn.id,
        providerStatus,
      );
    });
  }
}

export default new RechargeStatusService();
//sahi
