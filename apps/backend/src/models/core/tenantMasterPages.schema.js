import {
  mysqlTable,
  timestamp,
  varchar,
  boolean,
  int,
  index,
} from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';
import { uniqueIndex } from 'drizzle-orm/mysql-core';

export const tenantMasterPagesTable = mysqlTable(
  'master_pages',
  {
    id: varchar('id', { length: 36 })
      .primaryKey()
      .default(sql`(UUID())`),

    pageType: varchar('page_type', { length: 30 }).notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull(),

    status: varchar('status', { length: 20 }).notNull().default('DRAFT'), // DRAFT | PUBLISHED | ARCHIVED

    version: int('version').notNull().default(1),
    isHomePage: boolean('is_home_page').notNull().default(false),

    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    uniqSlug: uniqueIndex('uniq_master_slug').on(table.slug),
    uniqPageType: uniqueIndex('uniq_master_page_type').on(table.pageType),
    idxPageType: index('idx_master_page_type').on(table.pageType),
  }),
);
