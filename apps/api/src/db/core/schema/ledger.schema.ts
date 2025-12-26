import {
  pgTable,
  uuid,
  timestamp,
  foreignKey,
  pgEnum,
  integer,
} from 'drizzle-orm/pg-core';
import { refundTable, transactionTable, walletTable } from './index';

export const ledgerEntryType = pgEnum('ledger_entry_type', ['DEBIT', 'CREDIT']);

export const ledgerTable = pgTable(
  'ledgers',
  {
    id: uuid().primaryKey().defaultRandom(),
    walletId: uuid().notNull(),
    transactionId: uuid(),
    refundId: uuid(),
    entryType: ledgerEntryType('entry_type').notNull(),
    amount: integer('amount').notNull().default(0), // paise
    balanceAfter: integer('balance_after').notNull().default(0), // paise
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
