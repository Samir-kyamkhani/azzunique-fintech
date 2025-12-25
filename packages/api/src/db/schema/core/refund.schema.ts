import {
  pgTable,
  uuid,
  timestamp,
  foreignKey,
  pgEnum,
  integer,
} from 'drizzle-orm/pg-core';
import { tenantsTable, transactionTable, usersTable } from './index';

export const refundStatus = pgEnum('refund_status', [
  'PENDING',
  'SUCCESS',
  'FAILED',
]);

export const refundTable = pgTable(
  'refunds',
  {
    id: uuid().primaryKey().defaultRandom(),
    transactionId: uuid(),
    tenantId: uuid().notNull(),
    amount: integer('amount').notNull().default(0), // paise
    status: refundStatus('status').default('PENDING').notNull(),
    initiatedByUserId: uuid().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },

  (table) => ({
    tenantFk: foreignKey({
      columns: [table.tenantId],
      foreignColumns: [tenantsTable.id],
    }),

    transactionFk: foreignKey({
      columns: [table.transactionId],
      foreignColumns: [transactionTable.id],
    }),

    userFk: foreignKey({
      columns: [table.initiatedByUserId],
      foreignColumns: [usersTable.id],
    }),
  }),
);
