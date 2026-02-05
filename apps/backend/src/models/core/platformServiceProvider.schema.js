import {
  mysqlTable,
  timestamp,
  foreignKey,
  varchar,
  boolean,
  json,
  uniqueIndex,
} from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

import { platformServiceTable, serviceProviderTable } from './index.js';

export const platformServiceProviderTable = mysqlTable(
  'platform_service_providers',
  {
    id: varchar('id', { length: 36 })
      .primaryKey()
      .default(sql`(UUID())`),

    platformServiceId: varchar('platform_service_id', { length: 36 }).notNull(),
    serviceProviderId: varchar('service_provider_id', { length: 36 }).notNull(),

    config: json('config').notNull(),

    isActive: boolean('is_active').default(true).notNull(),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },

  (table) => ({
    platformServiceFk: foreignKey({
      name: 'psp_platform_service_fk',
      columns: [table.platformServiceId],
      foreignColumns: [platformServiceTable.id],
    }),

    serviceProviderFk: foreignKey({
      name: 'psp_service_provider_fk',
      columns: [table.serviceProviderId],
      foreignColumns: [serviceProviderTable.id],
    }),

    uniqPlatformServiceProvider: uniqueIndex(
      'uniq_platform_service_provider',
    ).on(table.platformServiceId, table.isActive),
  }),
);
