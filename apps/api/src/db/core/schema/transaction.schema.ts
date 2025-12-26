import {
  mysqlTable,
  timestamp,
  foreignKey,
  varchar,
  json,
  int,
  uniqueIndex,
} from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

import { tenantsTable, usersTable } from './index';

export const transactionTable = mysqlTable(
  'transactions',
  {
    id: varchar('id', { length: 36 })
      .primaryKey()
      .default(sql`(UUID())`),

    tenantId: varchar('tenant_id', { length: 36 }).notNull(),
    platformServiceId: varchar('platform_service_id', { length: 36 }).notNull(),
    platformServiceFeatureId: varchar('platform_service_feature_id', {
      length: 36,
    }),

    referenceId: varchar('reference_id', { length: 40 }).notNull(),
    providerReferenceId: varchar('provider_reference_id', {
      length: 40,
    }).unique(),

    amount: int('amount').notNull().default(0), // stored in paise

    status: varchar('status', { length: 20 }).notNull().default('INITIATED'),
    // INITIATED | PENDING | SUCCESS | FAILED | CANCELLED | REFUNDED

    failureReason: varchar('failure_reason', { length: 500 }),

    idempotencyKey: varchar('idempotency_key', { length: 100 }).notNull(),

    initiatedByUserId: varchar('initiated_by_user_id', {
      length: 36,
    }).notNull(),

    metaData: json('meta_data'),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },

  (table) => ({
    initiatedByUserFk: foreignKey({
      name: 'txn_initiated_by_user_fk',
      columns: [table.initiatedByUserId],
      foreignColumns: [usersTable.id],
    }),

    tenantFk: foreignKey({
      name: 'txn_tenant_fk',
      columns: [table.tenantId],
      foreignColumns: [tenantsTable.id],
    }),

    uniqTxnIdempotency: uniqueIndex('uniq_txn_tenant_idempotency').on(
      table.tenantId,
      table.idempotencyKey,
    ),
  }),
);
