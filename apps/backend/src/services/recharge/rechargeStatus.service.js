import { rechargeDb as db } from '../../database/recharge/recharge-db.js';
import { rechargeTransactionTable } from '../../models/recharge/index.js';
import { eq } from 'drizzle-orm';
import WalletService from '../wallet.service.js';
import CommissionReversalService from '../commission-reversal.service.js';
import { getRechargePlugin } from '../../plugin_registry/pluginRegistry.js';
import { ApiError } from '../../lib/ApiError.js';

class RechargeStatusService {
  /**
   * CRON ENTRY
   * Called every X minutes
   */
  async processPendingTransactions() {
    const pendingTxns = await db
      .select()
      .from(rechargeTransactionTable)
      .where(eq(rechargeTransactionTable.status, 'PENDING'))
      .limit(50);

    for (const txn of pendingTxns) {
      try {
        await this.checkAndResolve(txn);
      } catch (err) {
        console.error(
          '[RechargeStatusService] check failed',
          txn.id,
          err.message,
        );
      }
    }
  }

  // Resolve single transaction status from provider
  async checkAndResolve(txn) {
    // SAFETY: provider must be frozen on transaction
    if (!txn.providerId || !txn.providerCode) {
      throw ApiError.internal(`Provider not bound to transaction ${txn.id}`);
    }

    // Provider plugin (FROZEN)
    const plugin = getRechargePlugin(txn.providerCode, txn.providerConfig);

    if (typeof plugin.checkStatus !== 'function') {
      // Provider does not support polling
      return;
    }

    // Call provider status API
    const statusResp = await plugin.checkStatus({
      transId: txn.id,
      providerTxnId: txn.providerTxnId,
    });

    const providerStatus = String(statusResp?.status ?? '')
      .trim()
      .toUpperCase();

    // Still pending → wait for callback / next cron
    if (['FAIL', 'FAILED', 'FAILURE', 'ERROR'].includes(providerStatus)) {
      return;
    }

    // Lock transaction before mutating
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
        /**
         * IMPORTANT:
         * - Wallet debit
         * - Commission credit
         * handled ONLY via callback
         *
         * Cron only finalizes status
         */
        await tx
          .update(rechargeTransactionTable)
          .set({
            status: 'SUCCESS',
            providerTxnId: lockedTxn.providerTxnId || statusResp.optransid,
            referenceId: lockedTxn.referenceId || statusResp.referenceid,
            updatedAt: new Date(),
          })
          .where(eq(rechargeTransactionTable.id, lockedTxn.id));

        // Wallet settlement handled only via callback

        return;
      }

      // FAIL
      if (providerStatus === 'FAIL' || providerStatus === 'FAILED') {
        // 🔒 DEFENSIVE GUARD
        if (!lockedTxn.blockedAmount || lockedTxn.blockedAmount <= 0) {
          console.warn('[RechargeCron] Blocked amount missing', lockedTxn.id);
          return;
        }

        // Refund blocked amount
        await WalletService.releaseBlockedAmount({
          walletId: lockedTxn.walletId,
          amount: lockedTxn.amount,
          transactionId: lockedTxn.id,
          reference: `RECHARGE_FAILURE:${lockedTxn.id}`,
        });

        // Reverse commission if any (safe even if none)
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

      // Unknown status - log and skip
      console.warn(
        '[RechargeStatusService] Unknown provider status',
        txn.id,
        statusResp,
      );
    });
  }
}

export default new RechargeStatusService();
