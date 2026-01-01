import {
  mysqlTable,
  varchar,
  timestamp,
  foreignKey,
  int,
  index,
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

    entryType: varchar('entry_type', { length: 10 }).notNull(), // DEBIT | CREDIT

    amount: int('amount').notNull().default(0), // paise
    balanceAfter: int('balance_after').notNull().default(0), // paise

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },

  (table) => ({
    ledgerWalletFk: foreignKey({
      name: 'ledger_wallet_fk',
      columns: [table.walletId],
      foreignColumns: [walletTable.id],
    }),

    ledgerTransactionFk: foreignKey({
      name: 'ledger_transaction_fk',
      columns: [table.transactionId],
      foreignColumns: [transactionTable.id],
    }),

    ledgerRefundFk: foreignKey({
      name: 'ledger_refund_fk',
      columns: [table.refundId],
      foreignColumns: [refundTable.id],
    }),

    idxLedgerWalletCreated: index('idx_ledger_wallet_created').on(
      table.walletId,
      table.createdAt,
    ),

    idxLedgerTransaction: index('idx_ledger_transaction').on(
      table.transactionId,
    ),
  }),
);
