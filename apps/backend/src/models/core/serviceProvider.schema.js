import {
  mysqlTable,
  timestamp,
  varchar,
  boolean,
  foreignKey,
  uniqueIndex,
  index,
} from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

import { platformServiceTable } from './index';

export const serviceProviderTable = mysqlTable(
  'service_providers',
  {
    id: varchar('id', { length: 36 })
  .primaryKey()
  .default(sql`(UUID())`),

    platformServiceId: varchar('platform_service_id', {
      length: 36,
    }).notNull(),

    code: varchar('code', { length: 40 }).notNull(),

    providerName: varchar('provider_name', {
      length: 100,
    }).notNull(),

    handler: varchar('handler', { length: 200 }).notNull(),

    isActive: boolean('is_active').default(true).notNull(),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },

  (table) => ({
    spPlatformServiceFk: foreignKey({
      name: 'sp_ps_fk',
      columns: [table.platformServiceId],
      foreignColumns: [platformServiceTable.id],
    }),

    uniqServiceProvider: uniqueIndex('uniq_service_provider').on(
      table.platformServiceId,
      table.code,
    ),

    idxServiceProviderService: index('idx_service_provider_service').on(
      table.platformServiceId,
    ),

    idxServiceProviderActive: index('idx_service_provider_active').on(
      table.isActive,
    ),
  }),
);
