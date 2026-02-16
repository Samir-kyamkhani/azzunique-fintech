import {
  mysqlTable,
  varchar,
  json,
  timestamp,
  uniqueIndex,
  index,
} from 'drizzle-orm/mysql-core';

export const panCallbackTable = mysqlTable(
  'pan_callbacks',
  {
    id: varchar('id', { length: 36 }).primaryKey(),

    sessionId: varchar('session_id', { length: 36 }).notNull(),

    providerTxnId: varchar('provider_txn_id', { length: 100 }).notNull(),

    status: varchar('status', { length: 20 }).notNull(), // VERIFIED | FAILED

    message: varchar('message', { length: 255 }),

    rawPayload: json('raw_payload').notNull(),

    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    uniqReplay: uniqueIndex('uniq_pan_callback').on(
      table.sessionId,
      table.providerTxnId,
      table.status,
    ),

    idxSession: index('idx_pan_callback_session').on(table.sessionId),
  }),
);
