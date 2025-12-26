import {
  mysqlTable,
  timestamp,
  foreignKey,
  varchar,
  boolean,
  json,
} from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

import {
  platformServiceTable,
  serviceProviderTable,
  tenantsTable,
} from './index';

export const tenantServiceProviderTable = mysqlTable(
  'tenant_service_providers',
  {
    id: varchar('id', { length: 36 })
  .primaryKey()
  .default(sql`(UUID())`),

    tenantId: varchar('tenant_id', { length: 36 }).notNull(),
    platformServiceId: varchar('platform_service_id', { length: 36 }).notNull(),
    serviceProviderId: varchar('service_provider_id', { length: 36 }).notNull(),

    config: json('config').notNull(),

    isActive: boolean('is_enabled').default(true).notNull(),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },

  (table) => ({
    tenantFk: foreignKey({
      name: 'tsp_tenant_fk',
      columns: [table.tenantId],
      foreignColumns: [tenantsTable.id],
    }),

    platformServiceFk: foreignKey({
      name: 'tsp_platform_service_fk',
      columns: [table.platformServiceId],
      foreignColumns: [platformServiceTable.id],
    }),

    serviceProviderFk: foreignKey({
      name: 'tsp_service_provider_fk',
      columns: [table.serviceProviderId],
      foreignColumns: [serviceProviderTable.id],
    }),
  }),
);
