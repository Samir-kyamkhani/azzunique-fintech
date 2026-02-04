// jobs/rechargeAutoRetry.cron.js
import RechargeRetryService from '../services/recharge/rechargeRetry.service.js';
import { rechargeDb as db } from '../database/recharge/recharge-db.js';
import { rechargeTransactionTable } from '../models/recharge/index.js';
import { lt, eq } from 'drizzle-orm';

export async function autoRetryPendingRecharges() {
  const stuckTxns = await db
    .select()
    .from(rechargeTransactionTable)
    .where(
      and(
        eq(rechargeTransactionTable.status, 'PENDING'),
        lt(rechargeTransactionTable.updatedAt, new Date(Date.now() - 5 * 60 * 1000))
      )
    )
    .limit(50);

  for (const txn of stuckTxns) {
    try {
      await RechargeRetryService.retry(txn.id, {
        id: txn.userId,
        roleLevel: 0, // system
      });
    } catch (e) {
      console.error('Auto retry failed', txn.id, e.message);
    }
  }
}
