import {
  mysqlTable,
  varchar,
  json,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/mysql-core';

export const rechargeCallbackTable = mysqlTable(
  'recharge_callbacks',
  {
    id: varchar('id', { length: 36 }).primaryKey(),

    transactionId: varchar('transaction_id', { length: 36 }).notNull(),
    providerTxnId: varchar('provider_txn_id', { length: 100 }).notNull(),

    status: varchar('status', { length: 20 }).notNull(),
    message: varchar('message', { length: 255 }),

    rawPayload: json('raw_payload').notNull(),

    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    uniqReplay: uniqueIndex('uniq_recharge_callback').on(
      table.transactionId,
      table.providerTxnId,
      table.status,
    ),
  }),
);
