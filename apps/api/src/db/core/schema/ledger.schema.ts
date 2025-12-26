import {
  mysqlTable,
  varchar,
  timestamp,
  foreignKey,
  text,
  int,
} from 'drizzle-orm/mysql-core';
import { refundTable, transactionTable, walletTable } from './index';

export const ledgerTable = mysqlTable(
  'ledgers',
  {
    id: varchar('id', { length: 36 }).primaryKey().default('UUID()'),
    walletId: varchar('wallet_id', { length: 36 }).notNull(),
    transactionId: varchar('transaction_id', { length: 36 }),
    refundId: varchar('refund_id', { length: 36 }),

    entryType: text('entry_type', { enum: ['DEBIT', 'CREDIT'] }).notNull(),
    amount: int('amount').notNull().default(0), // paise
    balanceAfter: int('balance_after').notNull().default(0), // paise

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    walletFk: foreignKey({
      columns: [table.walletId],
      foreignColumns: [walletTable.id],
    }),

    transactionFk: foreignKey({
      columns: [table.transactionId],
      foreignColumns: [transactionTable.id],
    }),

    refundFk: foreignKey({
      columns: [table.refundId],
      foreignColumns: [refundTable.id],
    }),
  }),
);
