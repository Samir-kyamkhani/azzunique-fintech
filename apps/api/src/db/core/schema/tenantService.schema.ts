import {
  mysqlTable,
  timestamp,
  foreignKey,
  varchar,
  boolean,
} from 'drizzle-orm/mysql-core';
import { platformServiceTable, tenantsTable } from './index';

export const tenantServiceTable = mysqlTable(
  'tenant_services',
  {
    id: varchar('id', { length: 36 }).primaryKey().default('UUID()'),

    tenantId: varchar('tenant_id', { length: 36 }).notNull(),
    platformServiceId: varchar('platform_service_id', { length: 36 }).notNull(),

    isEnabled: boolean('is_enabled').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },

  (table) => ({
    tenantFk: foreignKey({
      columns: [table.tenantId],
      foreignColumns: [tenantsTable.id],
    }),

    platformServiceFk: foreignKey({
      columns: [table.platformServiceId],
      foreignColumns: [platformServiceTable.id],
    }),
  }),
);
