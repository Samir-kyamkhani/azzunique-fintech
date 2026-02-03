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
        entryType: 'DEBIT',
        amount,
        balanceAfter: newBalance,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });

    return true;
  }

  // 6️⃣ COMMISSION → MAIN TRANSFER
  static async transferCommissionToMain({ userId, tenantId, amount }) {
    if (amount <= 0) {
      throw ApiError.badRequest('Invalid amount');
    }

    const wallets = await this.getUserWallets(userId, tenantId);

    const commissionWallet = wallets.find((w) => w.walletType === 'COMMISSION');
    const mainWallet = wallets.find((w) => w.walletType === 'MAIN');

    if (!commissionWallet || !mainWallet) {
      throw ApiError.notFound('Required wallets not found');
    }

    await db.transaction(async () => {
      await this.debitWallet({
        walletId: commissionWallet.id,
        amount,
      });

      await this.creditWallet({
        walletId: mainWallet.id,
        amount,
      });
    });

    return true;
  }

  // 7️⃣ BLOCK AMOUNT (NO BALANCE CHANGE)
  static async blockAmount({ walletId, amount, transactionId }) {
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
        entryType: 'BLOCK',
        amount,
        balanceAfter: wallet.balance, // balance unchanged
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });
  }

  // 8️⃣ RELEASE BLOCKED AMOUNT (FAIL / TIMEOUT)
  static async releaseBlockedAmount({ walletId, amount, transactionId }) {
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
        entryType: 'UNBLOCK',
        amount,
        balanceAfter: wallet.balance,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });
  }

  // 9️⃣ DEBIT BLOCKED AMOUNT (SUCCESS CASE ONLY)
  static async debitBlockedAmount({ walletId, amount, transactionId }) {
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
        entryType: 'DEBIT',
        amount,
        balanceAfter: newBalance,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });
  }

  // 🔟 FETCH COMMISSION WALLET
  static async getCommissionWallet(userId, tenantId) {
    const [wallet] = await db
      .select()
      .from(walletTable)
      .where(
        and(
          eq(walletTable.ownerId, userId),
          eq(walletTable.ownerType, 'USER'),
          eq(walletTable.walletType, 'COMMISSION'),
          eq(walletTable.tenantId, tenantId),
        ),
      )
      .limit(1);

    if (!wallet) {
      throw ApiError.notFound('Commission wallet not found');
    }

    return wallet;
  }
}

export default WalletService;
