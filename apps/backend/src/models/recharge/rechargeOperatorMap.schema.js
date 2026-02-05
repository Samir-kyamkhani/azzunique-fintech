import { mysqlTable, timestamp, varchar, unique } from 'drizzle-orm/mysql-core';

export const rechargeOperatorMapTable = mysqlTable(
  'recharge_operator_map',
  {
    id: varchar('id', { length: 36 }).primaryKey(),

    platformServiceId: varchar('platform_service_id', { length: 36 }).notNull(),

    providerCode: varchar('provider_code', { length: 30 }).notNull(), // ✅ NEW

    internalOperatorCode: varchar('internal_operator_code', {
      length: 20,
    }).notNull(),

    providerOperatorCode: varchar('provider_operator_code', {
      length: 20,
    }).notNull(), // ✅ SINGLE SOURCE

    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    uniq: unique().on(
      table.internalOperatorCode,
      table.platformServiceId,
      table.providerCode,
    ),
  }),
);
