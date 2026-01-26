import { sql } from 'drizzle-orm';
import { json, timestamp } from 'drizzle-orm/gel-core';
import { int, mysqlTable, varchar } from 'drizzle-orm/mysql-core';

export const tenantPageSectionsTable = mysqlTable('tenant_page_sections', {
  id: varchar('id', { length: 36 })
    .primaryKey()
    .default(sql`(UUID())`),

  tenantPageId: varchar('tenant_page_id', { length: 36 }).notNull(),

  sectionType: varchar('section_type', { length: 50 }).notNull(),
  // HERO | FEATURES | PRICING | PORTFOLIO | CTA | TESTIMONIAL

  sortOrder: int('sort_order').notNull(),

  sectionData: json('section_data').notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
});
