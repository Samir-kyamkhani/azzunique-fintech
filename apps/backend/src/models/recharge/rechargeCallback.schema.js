import { json, mysqlTable, timestamp, varchar } from 'drizzle-orm/mysql-core';

export const rechargeCallbackTable = mysqlTable('recharge_callbacks', {
  id: varchar('id', { length: 36 }).primaryKey(),

  transactionId: varchar('transaction_id', { length: 36 }).notNull(),

  status: varchar('status', { length: 20 }).notNull(),
  providerTxnId: varchar('provider_txn_id', { length: 100 }),
  message: varchar('message', { length: 255 }),

  rawPayload: json('raw_payload').notNull(),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
