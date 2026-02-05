import { db } from '../database/core/core-db.js';
import { walletTable, ledgerTable } from '../models/core/index.js';
import { eq, and } from 'drizzle-orm';
import { ApiError } from '../lib/ApiError.js';
import crypto from 'crypto';

class WalletService {
  // 1️⃣ CREATE WALLET (INTERNAL USE ONLY)
  static async createWallet({
    tenantId,
    ownerType, // USER | TENANT
    ownerId,
    walletType, // MAIN | COMMISSION | SECURITY | SETTLEMENT
  }) {
    const [existing] = await db
      .select({ id: walletTable.id })
      .from(walletTable)
      .where(
        and(
          eq(walletTable.tenantId, tenantId),
          eq(walletTable.ownerType, ownerType),
          eq(walletTable.ownerId, ownerId),
          eq(walletTable.walletType, walletType),
        ),
      )
      .limit(1);

    if (existing) return existing;

    const walletId = crypto.randomUUID();

    await db.insert(walletTable).values({
      id: walletId,
      tenantId,
      ownerType,
      ownerId,
      walletType,
      balance: 0,
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return { id: walletId };
  }

  // 2️⃣ AUTO WALLET SETUP ON USER CREATE
  static async createDefaultUserWallets(user) {
    // MAIN (mandatory)
    await this.createWallet({
      tenantId: user.tenantId,
      ownerType: 'USER',
      ownerId: user.id,
      walletType: 'MAIN',
    });

    // COMMISSION (recommended default ON)
    await this.createWallet({
      tenantId: user.tenantId,
      ownerType: 'USER',
      ownerId: user.id,
      walletType: 'COMMISSION',
    });
  }

  // 3️⃣ FETCH USER WALLETS
  static async getUserWallets(userId, tenantId) {
    return db
      .select()
      .from(walletTable)
      .where(
        and(
          eq(walletTable.ownerType, 'USER'),
          eq(walletTable.ownerId, userId),
          eq(walletTable.tenantId, tenantId),
        ),
      );
  }

  // 4️⃣ CREDIT WALLET (LEDGER SAFE)
  static async creditWallet({
    walletId,
    amount, // paise
    transactionId = null,
    refundId = null,
    reference = null,
  }) {
    if (amount <= 0) {
      throw ApiError.badRequest('Invalid credit amount');
    }

    await db.transaction(async (tx) => {
      //  ROW LOCK
      const [wallet] = await tx
        .select()
        .from(walletTable)
        .where(eq(walletTable.id, walletId))
        .forUpdate()
        .limit(1);

      if (!wallet) {
        throw ApiError.notFound('Wallet not found');
      }

      const newBalance = wallet.balance + amount;

      await tx
        .update(walletTable)
        .set({
          balance: newBalance,
          updatedAt: new Date(),
        })
        .where(eq(walletTable.id, walletId));

      await tx.insert(ledgerTable).values({
        id: crypto.randomUUID(),
        walletId,
        transactionId,
        refundId,
        reference: reference || crypto.randomUUID(),
        entryType: 'CREDIT',
        amount,
        balanceAfter: newBalance,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });

    return true;
  }

  // 5️⃣ DEBIT WALLET (STRICT RULES)
  static async debitWallet({
    walletId,
    amount, // paise
    transactionId = null,
    reference = null,
  }) {
    if (amount <= 0) {
      throw ApiError.badRequest('Invalid debit amount');
    }

    await db.transaction(async (tx) => {
      // 🔐 ROW LOCK
      const [wallet] = await tx
        .select()
        .from(walletTable)
        .where(eq(walletTable.id, walletId))
        .forUpdate()
        .limit(1);

      if (!wallet) {
        throw ApiError.notFound('Wallet not found');
      }

      if (wallet.walletType === 'SECURITY') {
        throw ApiError.forbidden('Security wallet cannot be debited');
      }

      if (wallet.balance < amount) {
        throw ApiError.badRequest('Insufficient balance');
      }

      const newBalance = wallet.balance - amount;

      await tx
        .update(walletTable)
        .set({
          balance: newBalance,
          updatedAt: new Date(),
        })
        .where(eq(walletTable.id, walletId));

      await tx.insert(ledgerTable).values({
        id: crypto.randomUUID(),
        walletId,
        transactionId,
        reference: reference || crypto.randomUUID(),
        entryType: 'DEBIT',
        amount,
        balanceAfter: newBalance,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });

    return true;
  }

  // 6️⃣ BLOCK AMOUNT (NO BALANCE CHANGE)
  static async blockAmount({ walletId, amount, transactionId, reference = null }) {
    if (amount <= 0) {
      throw ApiError.badRequest('Invalid block amount');
    }

    await db.transaction(async (tx) => {
      const [wallet] = await tx
        .select()
        .from(walletTable)
        .where(eq(walletTable.id, walletId))
        .forUpdate()
        .limit(1);

      if (!wallet) {
        throw ApiError.notFound('Wallet not found');
      }

      const available = wallet.balance - wallet.blockedAmount;

      if (available < amount) {
        throw ApiError.badRequest('Insufficient available balance');
      }

      const newBlocked = wallet.blockedAmount + amount;

      await tx
        .update(walletTable)
        .set({
          blockedAmount: newBlocked,
          updatedAt: new Date(),
        })
        .where(eq(walletTable.id, walletId));

      // 🔐 LEDGER ENTRY (BLOCK)
      await tx.insert(ledgerTable).values({
        id: crypto.randomUUID(),
        walletId,
        transactionId,
        reference: reference || crypto.randomUUID(),
        entryType: 'BLOCK',
        amount,
        balanceAfter: wallet.balance, // balance unchanged
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });
  }

  // 7️⃣ RELEASE BLOCKED AMOUNT (FAIL / TIMEOUT)
  static async releaseBlockedAmount({ walletId, amount, transactionId, reference = null }) {
    if (amount <= 0) return;

    await db.transaction(async (tx) => {
      const [wallet] = await tx
        .select()
        .from(walletTable)
        .where(eq(walletTable.id, walletId))
        .forUpdate()
        .limit(1);

      if (!wallet) {
        throw ApiError.notFound('Wallet not found');
      }

      if (wallet.blockedAmount < amount) return;

      const newBlocked = wallet.blockedAmount - amount;

      await tx
        .update(walletTable)
        .set({
          blockedAmount: newBlocked,
          updatedAt: new Date(),
        })
        .where(eq(walletTable.id, walletId));

      // 🔐 LEDGER ENTRY (UNBLOCK)
      await tx.insert(ledgerTable).values({
        id: crypto.randomUUID(),
        walletId,
        transactionId,
        reference: reference || crypto.randomUUID(),
        entryType: 'UNBLOCK',
        amount,
        balanceAfter: wallet.balance,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });
  }

  // 8️⃣ DEBIT BLOCKED AMOUNT (SUCCESS CASE ONLY)
  static async debitBlockedAmount({ walletId, amount, transactionId, reference = null }) {
    if (amount <= 0) {
      throw ApiError.badRequest('Invalid debit amount');
    }

    await db.transaction(async (tx) => {
      // 🔐 ROW LOCK
      const [wallet] = await tx
        .select()
        .from(walletTable)
        .where(eq(walletTable.id, walletId))
        .forUpdate()
        .limit(1);

      if (!wallet) {
        throw ApiError.notFound('Wallet not found');
      }

      if (wallet.blockedAmount < amount) {
        throw ApiError.badRequest('Blocked amount insufficient');
      }

      if (wallet.balance < amount) {
        throw ApiError.badRequest('Wallet balance insufficient');
      }

      const newBalance = wallet.balance - amount;
      const newBlocked = wallet.blockedAmount - amount;

      // 🔄 UPDATE WALLET
      await tx
        .update(walletTable)
        .set({
          balance: newBalance,
          blockedAmount: newBlocked,
          updatedAt: new Date(),
        })
        .where(eq(walletTable.id, walletId));

      // 📒 LEDGER ENTRY (FINAL DEBIT)
      await tx.insert(ledgerTable).values({
        id: crypto.randomUUID(),
        walletId,
        transactionId,
        reference: reference || crypto.randomUUID(),
        entryType: 'DEBIT',
        amount,
        balanceAfter: newBalance,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });
  }
}

export default WalletService;
