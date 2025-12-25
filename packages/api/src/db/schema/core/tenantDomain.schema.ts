import {
  pgTable,
  uuid,
  timestamp,
  foreignKey,
  varchar,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { serverDetailTable, tenantsTable, usersTable } from './index';

export const tenantDomainsStatus = pgEnum('tenant_domains_status', [
  'ACTIVE',
  'INACTIVE',
  'SUSPENDED',
  'DELETED',
]);

export const tenantsDomainsTable = pgTable(
  'tenants_domains',
  {
    id: uuid().primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull(),
    domainName: varchar('domain_name', { length: 255 }).notNull().unique(),
    status: tenantDomainsStatus().notNull(),
    createdbyEmployeeId: uuid('created_by_employee_id'),
    createdbyUserId: uuid('created_by_user_id').notNull(),
    serverDetailId: uuid('server_detail_id'),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },

  (table) => ({
    parentTenantFk: foreignKey({
      columns: [table.tenantId],
      foreignColumns: [tenantsTable.id],
    }),

    userFk: foreignKey({
      columns: [table.createdbyUserId],
      foreignColumns: [usersTable.id],
    }),

    serverFk: foreignKey({
      columns: [table.serverDetailId],
      foreignColumns: [serverDetailTable.id],
    }),
  }),
);
