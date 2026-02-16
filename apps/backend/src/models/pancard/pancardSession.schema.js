import {
  mysqlTable,
  timestamp,
  varchar,
  json,
  uniqueIndex,
  index,
} from 'drizzle-orm/mysql-core';

export const panSessionTable = mysqlTable(
  'pan_sessions',
  {
    id: varchar('id', { length: 36 }).primaryKey(),

    tenantId: varchar('tenant_id', { length: 36 }).notNull(),
    userId: varchar('user_id', { length: 36 }).notNull(),

    panNumberEncrypted: varchar('pan_number_encrypted', {
      length: 255,
    }).notNull(),

    panHash: varchar('pan_hash', { length: 64 }).notNull(),

    maskedPan: varchar('masked_pan', { length: 20 }),

    idempotencyKey: varchar('idempotency_key', { length: 64 }).notNull(),

    providerCode: varchar('provider_code', { length: 40 }).notNull(),
    providerId: varchar('provider_id', { length: 36 }).notNull(),

    providerTxnId: varchar('provider_txn_id', { length: 100 }),

    status: varchar('status', { length: 20 }).notNull().default('INITIATED'),
    // INITIATED | VERIFIED | FAILED

    responsePayload: json('response_payload'),

    failureReason: varchar('failure_reason', { length: 255 }),

    verifiedAt: timestamp('verified_at'),

    consentGivenAt: timestamp('consent_given_at'),
    consentIp: varchar('consent_ip', { length: 45 }),

    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    uniqPanIdempotency: uniqueIndex('uniq_pan_idempotency').on(
      table.tenantId,
      table.idempotencyKey,
    ),

    idxUser: index('idx_pan_user').on(table.userId),

    idxPanHash: index('idx_pan_hash').on(table.panHash),
  }),
);
