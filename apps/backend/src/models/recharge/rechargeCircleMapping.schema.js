import {
  mysqlTable,
  timestamp,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/mysql-core';

export const rechargeCircleMapTable = mysqlTable(
  'recharge_circle_map',
  {
    id: varchar('id', { length: 36 }).primaryKey(),

    platformServiceId: varchar('platform_service_id', { length: 36 }).notNull(),
    serviceProviderId: varchar('service_provider_id', { length: 36 }).notNull(),
    internalCircleCode: varchar('internal_circle_code', {
      length: 20,
    }).notNull(),
    providerCircleCode: varchar('provider_circle_code', {
      length: 20,
    }).notNull(),

    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    uqCircleMap: uniqueIndex('uq_circle_map').on(
      table.platformServiceId,
      table.serviceProviderId,
      table.internalCircleCode,
    ),
  }),
);
