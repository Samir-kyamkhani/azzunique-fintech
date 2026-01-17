import { mysqlTable, timestamp, varchar } from 'drizzle-orm/mysql-core';

export const rechargeOperatorMapTable = mysqlTable('recharge_operator_map', {
  id: varchar('id', { length: 36 }).primaryKey(),

  platformServiceId: varchar('platform_service_id', { length: 36 }).notNull(),

  internalOperatorCode: varchar('internal_operator_code', {
    length: 20,
  }).notNull(),

  mplanOperatorCode: varchar('mplan_operator_code', { length: 10 }),
  rechargeExchangeOperatorCode: varchar('recharge_exchange_operator_code', {
    length: 10,
  }),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
