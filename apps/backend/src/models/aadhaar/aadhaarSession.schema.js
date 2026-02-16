import {
  mysqlTable,
  timestamp,
  varchar,
  int,
  uniqueIndex,
  json,
  index,
} from 'drizzle-orm/mysql-core';

export const aadhaarSessionTable = mysqlTable(
  'aadhaar_sessions',
  {
    id: varchar('id', { length: 36 }).primaryKey(),

    tenantId: varchar('tenant_id', { length: 36 }).notNull(),
    userId: varchar('user_id', { length: 36 }).notNull(),

    // 🔐 NEVER store plain Aadhaar
    aadhaarNumberEncrypted: varchar('aadhaar_number_encrypted', {
      length: 255,
    }).notNull(),

    maskedAadhaar: varchar('masked_aadhaar', { length: 20 }),

    idempotencyKey: varchar('idempotency_key', { length: 64 }).notNull(),

    platformServiceId: varchar('platform_service_id', {
      length: 36,
    }).notNull(),

    providerCode: varchar('provider_code', { length: 40 }).notNull(),
    providerId: varchar('provider_id', { length: 36 }).notNull(),

    providerConfig: json('provider_config').notNull(), // snapshot freeze

    referenceId: varchar('reference_id', { length: 100 }),
    providerTxnId: varchar('provider_txn_id', { length: 100 }),

    status: varchar('status', { length: 20 }).notNull().default('INITIATED'),
    // INITIATED | OTP_SENT | PENDING | VERIFIED | FAILED

    responsePayload: json('response_payload'),
    failureReason: varchar('failure_reason', { length: 255 }),

    attemptCount: int('attempt_count').default(0),
    lastAttemptAt: timestamp('last_attempt_at'),

    verifiedAt: timestamp('verified_at'),

    // ✅ Legal safety
    consentGivenAt: timestamp('consent_given_at'),
    consentIp: varchar('consent_ip', { length: 45 }),

    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    uniqAadhaarIdempotency: uniqueIndex('uniq_aadhaar_idempotency').on(
      table.tenantId,
      table.idempotencyKey,
    ),

    idxUser: index('idx_aadhaar_user').on(table.userId),

    idxStatus: index('idx_aadhaar_status').on(table.status),
  }),
);
