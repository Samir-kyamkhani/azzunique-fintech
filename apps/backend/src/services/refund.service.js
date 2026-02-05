import { db } from '../database/core/core-db.js';
import {
  refundTable,
  transactionTable,
  walletTable,
  ledgerTable,
} from '../models/core/index.js';
import { eq, and } from 'drizzle-orm';
import { ApiError } from '../lib/ApiError.js';
import crypto from 'crypto';
import CommissionReversalService from './commission-reversal.service.js';

class RefundService {
  static async initiateRefund({ transactionId, actor }) {
    return db.transaction(async (tx) => {
      const [txn] = await tx
        .select()
        .from(transactionTable)
        .where(eq(transactionTable.id, transactionId))
        .limit(1);

      if (!txn || txn.status !== 'SUCCESS') {
        throw ApiError.badRequest('Transaction not refundable');
      }

      const [existing] = await tx
        .select()
        .from(refundTable)
        .where(eq(refundTable.transactionId, transactionId))
        .limit(1);

      if (existing) {
        throw ApiError.conflict('Refund already initiated');
      }

      // LOCK MAIN WALLET
      const [wallet] = await tx
        .select()
        .from(walletTable)
        .where(
          and(
            eq(walletTable.ownerId, txn.initiatedByUserId),
            eq(walletTable.walletType, 'MAIN'),
          ),
        )
        .forUpdate()
        .limit(1);

      if (!wallet) {
        throw ApiError.notFound('Main wallet not found');
      }

      await tx
        .update(walletTable)
        .set({
          blockedAmount: wallet.blockedAmount + txn.amount,
          updatedAt: new Date(),
        })
        .where(eq(walletTable.id, wallet.id));

      await tx.insert(refundTable).values({
        id: crypto.randomUUID(),
        transactionId,
        tenantId: txn.tenantId,
        amount: txn.amount,
        status: 'PENDING',
        initiatedByUserId: actor.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });
  }

  static async completeRefund({ refundId }) {
    return db.transaction(async (tx) => {
      const [refund] = await tx
        .select()
        .from(refundTable)
        .where(eq(refundTable.id, refundId))
        .limit(1);

      if (!refund || refund.status !== 'PENDING') {
        throw ApiError.badRequest('Invalid refund');
      }

      // LOCK MAIN WALLET
      const [wallet] = await tx
        .select()
        .from(walletTable)
        .where(
          and(
            eq(walletTable.ownerId, refund.initiatedByUserId),
            eq(walletTable.walletType, 'MAIN'),
          ),
        )
        .forUpdate()
        .limit(1);

      if (!wallet || wallet.balance < refund.amount) {
        throw ApiError.badRequest('Insufficient balance for refund');
      }

      const newBalance = wallet.balance - refund.amount;

      await tx.update(walletTable).set({
        balance: newBalance,
        blockedAmount: wallet.blockedAmount - refund.amount,
        updatedAt: new Date(),
      });

      await tx.insert(ledgerTable).values({
        id: crypto.randomUUID(),
        walletId: wallet.id,
        refundId: refund.id,
        reference: `REFUND:${refund.id}:${wallet.id}`,
        entryType: 'DEBIT',
        amount: refund.amount,
        balanceAfter: newBalance,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await tx.update(refundTable).set({
        status: 'SUCCESS',
        updatedAt: new Date(),
      });

      await tx.update(transactionTable).set({
        status: 'REFUNDED',
        updatedAt: new Date(),
      });

      // Reverse commission AFTER refund success
      await CommissionReversalService.reverseByTransaction(
        refund.transactionId,
      );
    });
  }
}

export default RefundService;
