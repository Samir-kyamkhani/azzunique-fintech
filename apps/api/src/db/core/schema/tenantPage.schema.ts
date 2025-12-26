import {
  mysqlTable,
  timestamp,
  foreignKey,
  varchar,
  text,
} from 'drizzle-orm/mysql-core';
import { tenantsTable, usersTable } from './index';

export const tenantPagesTable = mysqlTable(
  'tenants_pages',
  {
    id: varchar('id', { length: 36 }).primaryKey().default('UUID()'),

    tenantId: varchar('tenant_id', { length: 36 }).notNull(),

    pageTitle: varchar('page_title', { length: 255 }).notNull(),
    pageContent: text('page_content'),
    pageUrl: varchar('page_url', { length: 255 }).notNull().unique(),

    status: text('status', {
      enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'],
    })
      .notNull()
      .default('DRAFT'),

    createdByUserId: varchar('created_by_user_id', { length: 36 }).notNull(),
    createdByEmployeeId: varchar('created_by_employee_id', { length: 36 }),

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
  }),
);
