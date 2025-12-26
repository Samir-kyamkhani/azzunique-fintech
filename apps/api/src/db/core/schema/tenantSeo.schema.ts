import {
  pgTable,
  uuid,
  timestamp,
  foreignKey,
  varchar,
  boolean,
} from 'drizzle-orm/pg-core';
import { tenantPagesTable } from './index';

export const tenantSeoTable = pgTable(
  'tenants_seo',
  {
    id: uuid().primaryKey().defaultRandom(),
    metaTitle: varchar('meta_title', { length: 255 }).notNull(),
    metaDescription: varchar('meta_description', { length: 1000 }),
    metaKeywords: varchar('meta_keywords', { length: 500 }),
    isIndexed: boolean('is_indexed').notNull().default(true),
    isFollowed: boolean('is_followed').notNull().default(true),
    tenantPageId: uuid('tenant_page_id').notNull(),

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
