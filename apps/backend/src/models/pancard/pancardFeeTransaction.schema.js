import {
  mysqlTable,
  timestamp,
  varchar,
  int,
  uniqueIndex,
  index,
} from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

export const panFeeTransactionTable = mysqlTable(
  'pan_fee_transactions',
  {
    id: varchar('id', { length: 36 })
      .primaryKey()
      .default(sql`(UUID())`),

    tenantId: varchar('tenant_id', { length: 36 }).notNull(),
    userId: varchar('user_id', { length: 36 }).notNull(),

    sessionId: varchar('session_id', { length: 36 }).notNull(),

    walletId: varchar('wallet_id', { length: 36 }).notNull(),

    amount: int('amount').notNull(),

    status: varchar('status', { length: 20 }).notNull(),
    // PENDING | DEBITED | FAILED

    reference: varchar('reference', { length: 100 }),

    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    uniqSessionFee: uniqueIndex('uniq_pan_fee_session').on(table.sessionId),

    idxFeeStatus: index('idx_pan_fee_status').on(table.status),
  }),
);
