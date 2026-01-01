import {
  mysqlTable,
  timestamp,
  foreignKey,
  varchar,
  boolean,
  uniqueIndex,
  index,
} from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

import { platformServiceTable, tenantsTable } from './index.js';

export const tenantServiceTable = mysqlTable(
  'tenant_services',
  {
    id: varchar('id', { length: 36 })
  .primaryKey()
  .default(sql`(UUID())`),

    tenantId: varchar('tenant_id', { length: 36 }).notNull(),
    platformServiceId: varchar('platform_service_id', {
      length: 36,
    }).notNull(),

    isEnabled: boolean('is_enabled').default(true).notNull(),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },

  (table) => ({
    tsTenantFk: foreignKey({
      name: 'ts_tenant_fk',
      columns: [table.tenantId],
      foreignColumns: [tenantsTable.id],
    }),

    tsPlatformServiceFk: foreignKey({
      name: 'ts_platform_service_fk',
      columns: [table.platformServiceId],
      foreignColumns: [platformServiceTable.id],
    }),

    uniqTenantService: uniqueIndex('uniq_tenant_service').on(
      table.tenantId,
      table.platformServiceId,
    ),

    idxTenantServiceTenant: index('idx_tenant_service_tenant').on(
      table.tenantId,
    ),

    idxTenantServiceEnabled: index('idx_tenant_service_enabled').on(
      table.isEnabled,
    ),
  }),
);
