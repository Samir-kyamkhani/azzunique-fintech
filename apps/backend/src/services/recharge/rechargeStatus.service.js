import { rechargeDb as db } from '../../database/recharge/recharge-db.js';
import { rechargeTransactionTable } from '../../models/recharge/index.js';
import { eq } from 'drizzle-orm';
import WalletService from '../wallet.service.js';
import CommissionReversalService from '../commission-reversal.service.js';

class RechargeStatusService {
  async processPendingTransactions() {
    // 1️⃣ Pending transactions (safe limit)
    const pendingTxns = await db
      .select()
      .from(rechargeTransactionTable)
      .where(eq(rechargeTransactionTable.status, 'PENDING'))
      .limit(50);

    for (const txn of pendingTxns) {
      await this.checkAndResolve(txn);
    }
  }

  async checkAndResolve(txn) {
    // 1️⃣ Resolve provider
    const { provider } = await RechargeRuntimeService.resolve({
      tenantChain: [txn.tenantId],
      platformServiceCode: 'RECHARGE',
    });

    const plugin = getRechargePlugin(
      provider.serviceProviderId,
      provider.config,
    );

    // 2️⃣ Call provider status API
    const statusResp = await plugin.checkStatus({
      transId: txn.id,
    });

    // Provider response: SUCCESS | FAIL | PENDING
    if (statusResp.status === 'PENDING') {
      return; // ⏳ wait for next cron
    }

    if (statusResp.status === 'SUCCESS') {
      await db
        .update(rechargeTransactionTable)
        .set({
          status: 'SUCCESS',
          providerTxnId: statusResp.optransid,
          updatedAt: new Date(),
        })
        .where(eq(rechargeTransactionTable.id, txn.id));

      return;
    }

    if (statusResp.status === 'FAIL') {
      // 3️⃣ Refund wallet
      await WalletService.creditWallet({
        walletId: txn.walletId,
        amount: txn.amount,
        transactionId: txn.id,
      });

      // 4️⃣ Reverse commission if any
      await CommissionReversalService.reverseByTransaction(txn.id);

      await db
        .update(rechargeTransactionTable)
        .set({
          status: 'FAILED',
          failureReason: statusResp.message || 'Recharge failed',
          updatedAt: new Date(),
        })
        .where(eq(rechargeTransactionTable.id, txn.id));
    }
  }
}

export default new RechargeStatusService();
