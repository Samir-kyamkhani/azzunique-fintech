import {
  mysqlTable,
  timestamp,
  foreignKey,
  varchar,
  json,
  int,
  text,
} from 'drizzle-orm/mysql-core';
import { tenantsTable, usersTable } from './index';

export const transactionTable = mysqlTable(
  'transactions',
  {
    id: varchar('id', { length: 36 }).primaryKey().default('UUID()'),

    tenantId: varchar('tenant_id', { length: 36 }).notNull(),
    platformServiceId: varchar('platform_service_id', { length: 36 }).notNull(),
    platformServiceFeatureId: varchar('platform_service_feature_id', {
      length: 36,
    }),

    referenceId: varchar('reference_id', { length: 40 }).notNull(),
    providerReferenceId: varchar('provider_reference_id', {
      length: 40,
    }).unique(),

    amount: int('amount').notNull().default(0), // paise

    status: text('status', {
      enum: [
        'INITIATED',
        'PENDING',
        'SUCCESS',
        'FAILED',
        'CANCELLED',
        'REFUNDED',
      ],
    })
      .notNull()
      .default('INITIATED'),

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
    userFk: foreignKey({
      columns: [table.initiatedByUserId],
      foreignColumns: [usersTable.id],
    }),

    tenantFk: foreignKey({
      columns: [table.tenantId],
      foreignColumns: [tenantsTable.id],
    }),
  }),
);
