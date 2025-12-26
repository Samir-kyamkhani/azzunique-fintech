import {
  mysqlTable,
  timestamp,
  foreignKey,
  varchar,
  boolean,
} from 'drizzle-orm/mysql-core';
import { tenantPagesTable } from './index';

export const tenantSeoTable = mysqlTable(
  'tenants_seo',
  {
    id: varchar('id', { length: 36 }).primaryKey().default('UUID()'),

    tenantPageId: varchar('tenant_page_id', { length: 36 }).notNull(),

    metaTitle: varchar('meta_title', { length: 255 }).notNull(),
    metaDescription: varchar('meta_description', { length: 1000 }),
    metaKeywords: varchar('meta_keywords', { length: 500 }),

    isIndexed: boolean('is_indexed').notNull().default(true),
    isFollowed: boolean('is_followed').notNull().default(true),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },

  (table) => ({
    tenantPageFk: foreignKey({
      columns: [table.tenantPageId],
      foreignColumns: [tenantPagesTable.id],
    }),
  }),
);
