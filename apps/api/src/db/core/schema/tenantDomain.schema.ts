import {
  mysqlTable,
  timestamp,
  foreignKey,
  varchar,
  text,
} from 'drizzle-orm/mysql-core';
import { serverDetailTable, tenantsTable, usersTable } from './index';

export const tenantsDomainsTable = mysqlTable(
  'tenants_domains',
  {
    id: varchar('id', { length: 36 }).primaryKey().default('UUID()'),
    tenantId: varchar('tenant_id', { length: 36 }).notNull(),
    domainName: varchar('domain_name', { length: 255 }).notNull().unique(),

    status: text('status', {
      enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'DELETED'],
    }).notNull(),

    createdByEmployeeId: varchar('created_by_employee_id', { length: 36 }),
    createdByUserId: varchar('created_by_user_id', { length: 36 }).notNull(),
    serverDetailId: varchar('server_detail_id', { length: 36 }),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },

  (table) => ({
    tenantFk: foreignKey({
      columns: [table.tenantId],
      foreignColumns: [tenantsTable.id],
    }),

    userFk: foreignKey({
      columns: [table.createdByUserId],
      foreignColumns: [usersTable.id],
    }),

    serverFk: foreignKey({
      columns: [table.serverDetailId],
      foreignColumns: [serverDetailTable.id],
    }),
  }),
);
