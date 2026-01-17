import { mysqlTable, timestamp, varchar } from 'drizzle-orm/mysql-core';

export const rechargeCircleMapTable = mysqlTable('recharge_circle_map', {
  id: varchar('id', { length: 36 }).primaryKey(),

  internalCircleCode: varchar('internal_circle_code', {
    length: 20,
  }).notNull(),

  mplanCircleCode: varchar('mplan_circle_code', { length: 10 }),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
