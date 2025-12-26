import {
  mysqlTable,
  varchar,
  timestamp,
  foreignKey,
  int,
  text,
  index,
  uniqueIndex,
} from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

import { tenantsTable, transactionTable, usersTable } from './index';

export const refundTable = mysqlTable(
  'refunds',
  {
    id: varchar('id', { length: 36 })
  .primaryKey()
  .default(sql`(UUID())`),

    transactionId: varchar('transaction_id', { length: 36 }),

    tenantId: varchar('tenant_id', { length: 36 }).notNull(),

    amount: int('amount').notNull().default(0), // paise

    status: text('status', {
      enum: ['PENDING', 'SUCCESS', 'FAILED'],
    })
      .notNull()
      .default('PENDING'),

    initiatedByUserId: varchar('initiated_by_user_id', {
      length: 36,
    }).notNull(),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },

  (table) => ({
    refundTenantFk: foreignKey({
      name: 'refund_tenant_fk',
      columns: [table.tenantId],
      foreignColumns: [tenantsTable.id],
    }),

    refundTransactionFk: foreignKey({
      name: 'refund_transaction_fk',
      columns: [table.transactionId],
      foreignColumns: [transactionTable.id],
    }),

    refundInitiatedByUserFk: foreignKey({
      name: 'refund_initiated_by_user_fk',
      columns: [table.initiatedByUserId],
      foreignColumns: [usersTable.id],
    }),

    uniqRefundPerTransaction: uniqueIndex('uniq_refund_transaction').on(
      table.transactionId,
    ),

    idxRefundTenantStatus: index('idx_refund_tenant_status').on(
      table.tenantId,
      table.status,
    ),

    idxRefundTransaction: index('idx_refund_transaction').on(
      table.transactionId,
    ),
  }),
);
