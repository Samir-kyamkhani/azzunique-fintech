import { sql } from 'drizzle-orm';
import {
  pgTable,
  uuid,
  timestamp,
  foreignKey,
  varchar,
  pgEnum,
  jsonb,
  integer,
  pgSequence,
} from 'drizzle-orm/pg-core';
import { tenantsTable, usersTable } from './index';

export const transactionStatus = pgEnum('transaction_status', [
  'INITIATED',
  'PENDING',
  'SUCCESS',
  'FAILED',
  'CANCELLED',
  'REFUNDED',
]);

export const txnSeq = pgSequence('txn_seq');

export const transactionTable = pgTable(
  'transactions',
  {
    id: uuid().primaryKey().defaultRandom(),
    tenantId: uuid().notNull(),
    platformServiceId: uuid().notNull(),
    platformServiceFeatureId: uuid(),
    referenceId: varchar('reference_id', { length: 40 })
      .default(
        sql`
    'TXN-' || to_char(now(), 'YYYYMMDD') || '-' || lpad(nextval('txn_seq')::text, 6, '0')
  `,
      )
      .notNull(),
    providerReferenceId: varchar('provider_reference_id', {
      length: 40,
    }).unique(),

    amount: integer('balance').notNull().default(0), // paise
    status: transactionStatus().default('INITIATED').notNull(),
    failureReason: varchar('failure_reason', { length: 500 }),
    idempotencyKey: varchar('idempotency_key', { length: 100 }).notNull(),
    initiatedByUserId: uuid().notNull(),
    metaData: jsonb('meta_data'), // dynamic data (beneficiary, bill info)

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },

  (table) => ({
    userIdFk: foreignKey({
      columns: [table.initiatedByUserId],
      foreignColumns: [usersTable.id],
    }),

    tenantIdFk: foreignKey({
      columns: [table.tenantId],
      foreignColumns: [tenantsTable.id],
    }),
  }),
);
