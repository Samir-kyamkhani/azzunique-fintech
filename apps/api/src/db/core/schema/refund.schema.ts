import {
  mysqlTable,
  varchar,
  timestamp,
  foreignKey,
  int,
  text,
} from 'drizzle-orm/mysql-core';
import { tenantsTable, transactionTable, usersTable } from './index';

export const refundTable = mysqlTable(
  'refunds',
  {
    id: varchar('id', { length: 36 }).primaryKey().default('UUID()'),
    transactionId: varchar('transaction_id', { length: 36 }),
    tenantId: varchar('tenant_id', { length: 36 }).notNull(),
    amount: int('amount').notNull().default(0), // paise
    status: text('status', { enum: ['PENDING', 'SUCCESS', 'FAILED'] })
      .notNull()
      .default('PENDING'),
    initiatedByUserId: varchar('initiated_by_user_id', {
      length: 36,
    }).notNull(),
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
