import { rechargeDb as db } from '../../database/recharge/recharge-db.js';
import { rechargeTransactionTable } from '../../models/recharge/index.js';
import { eq, and } from 'drizzle-orm';
import { ApiError } from '../../lib/ApiError.js';
import { canRetryRecharge } from '../../guard/rechargeRetry.guard.js';
import RechargeRuntimeService from './rechargeRuntime.service.js';

class RechargeRetryService {
  async retry(transactionId, actor) {
    return db.transaction(async (tx) => {
      // 1️⃣ Fetch transaction
      const [txn] = await tx
        .select()
        .from(rechargeTransactionTable)
        .where(eq(rechargeTransactionTable.id, transactionId))
        .limit(1);

      if (!txn) {
        throw ApiError.notFound('Recharge transaction not found');
      }

      // 2️⃣ Ownership check
      // Allow system / cron retry
      if (actor.roleLevel !== 0 && txn.userId !== actor.id) {
        throw ApiError.forbidden('Not your transaction');
      }

      // 3️⃣ Retry rules
      if (!canRetryRecharge(txn)) {
        throw ApiError.badRequest('Retry not allowed');
      }

      // 4️⃣ Atomic status update (CRITICAL)
      const result = await tx
        .update(rechargeTransactionTable)
        .set({
          status: 'PENDING',
          retryCount: txn.retryCount + 1,
          lastRetryAt: new Date(),
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(rechargeTransactionTable.id, transactionId),
            eq(rechargeTransactionTable.status, 'FAILED'),
          ),
        );

      if (result.rowsAffected === 0) {
        throw ApiError.badRequest('Transaction already retried');
      }

      // 5️⃣ Execute recharge
      await RechargeRuntimeService.execute({
        transactionId: txn.id,
        isRetry: true,
      });

      return { success: true };
    });
  }
}

export default new RechargeRetryService();
