import {
  mysqlTable,
  varchar,
  timestamp,
  foreignKey,
  int,
  index,
  uniqueIndex,
} from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

import { refundTable, transactionTable, walletTable } from './index.js';

export const ledgerTable = mysqlTable(
  'ledgers',
  {
    id: varchar('id', { length: 36 })
      .primaryKey()
      .default(sql`(UUID())`),

    walletId: varchar('wallet_id', { length: 36 }).notNull(),

    transactionId: varchar('transaction_id', { length: 36 }),
    refundId: varchar('refund_id', { length: 36 }),

    // 🔑 NEW: unique reference for idempotency
    reference: varchar('reference', { length: 100 }).notNull(),

    entryType: varchar('entry_type', { length: 10 }).notNull(), // DEBIT | CREDIT | BLOCK | UNBLOCK

    amount: int('amount').notNull().default(0),
    balanceAfter: int('balance_after').notNull().default(0),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },

  (table) => ({
    ledgerWalletFk: foreignKey({
      name: 'ledger_wallet_fk',
      columns: [table.walletId],
      foreignColumns: [walletTable.id],
    }),

    ledgerRefundFk: foreignKey({
      name: 'ledger_refund_fk',
      columns: [table.refundId],
      foreignColumns: [refundTable.id],
    }),

    // 🔐 UNIQUE REFERENCE INDEX
    uniqLedgerReference: uniqueIndex('uniq_ledger_reference').on(
      table.reference,
    ),

    idxLedgerWalletCreated: index('idx_ledger_wallet_created').on(
      table.walletId,
      table.createdAt,
    ),

  }),
);
