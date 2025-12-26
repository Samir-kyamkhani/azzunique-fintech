import {
  pgTable,
  uuid,
  timestamp,
  foreignKey,
  varchar,
  boolean,
} from 'drizzle-orm/pg-core';
import { tenantsTable, usersTable } from './index';

export const tenantPagesTable = pgTable(
  'tenants_pages',
  {
    id: uuid().primaryKey().defaultRandom(),
    pageTitle: varchar('page_title', { length: 255 }).notNull(),
    pageContent: varchar('page_content', { length: 5000 }),
    pageUrl: varchar('page_url', { length: 255 }).notNull().unique(),
    isPublished: boolean('is_published').notNull().default(false),
    tenantId: uuid('tenant_id').notNull(),
    createdByUserId: uuid('created_by_user_id').notNull(),
    createdByEmployeeId: uuid('created_by_employee_id'),
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
