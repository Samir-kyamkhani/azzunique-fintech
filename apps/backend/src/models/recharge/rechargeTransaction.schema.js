import {
  mysqlTable,
  timestamp,
  varchar,
  int,
  uniqueIndex,
  json,
} from 'drizzle-orm/mysql-core';

export const rechargeTransactionTable = mysqlTable(
  'recharge_transactions',
  {
    id: varchar('id', { length: 36 }).primaryKey(),

    tenantId: varchar('tenant_id', { length: 36 }).notNull(),
    userId: varchar('user_id', { length: 36 }).notNull(),

    mobileNumber: varchar('mobile_number', { length: 15 }).notNull(),
    operatorCode: varchar('operator_code', { length: 20 }).notNull(),

    idempotencyKey: varchar('idempotency_key', { length: 64 }).notNull(),

    amount: int('amount').notNull(), // paise
    blockedAmount: int('blocked_amount').notNull(),

    walletId: varchar('wallet_id', { length: 36 }).notNull(),

    platformServiceId: varchar('platform_service_id', { length: 36 }).notNull(),
    platformServiceFeatureId: varchar('platform_service_feature_id', {
      length: 36,
    }),

    providerCode: varchar('provider_code', { length: 40 }).notNull(),
    providerId: varchar('provider_id', { length: 36 }).notNull(),
    providerConfig: json('provider_config').notNull(),

    status: varchar('status', { length: 20 }).notNull(),
    // INITIATED | SUCCESS | FAILED | PENDING | REFUNDED

    providerResponse: json('provider_response').notNull(),

    providerTxnId: varchar('provider_txn_id', { length: 100 }),
    referenceId: varchar('reference_id', { length: 100 }),

    failureReason: varchar('failure_reason', { length: 255 }),

    retryCount: int('retry_count').default(0),
    lastRetryAt: timestamp('last_retry_at'),

    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    uniqRechargeIdempotency: uniqueIndex('uniq_recharge_idempotency').on(
      table.tenantId,
      table.idempotencyKey,
    ),
  }),
);
