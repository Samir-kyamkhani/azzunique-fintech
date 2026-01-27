import {
  mysqlTable,
  varchar,
  int,
  json,
  foreignKey,
  timestamp,
  uniqueIndex,
  index,
} from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';
import { tenantMasterPagesTable } from './tenantMasterPages.schema.js';

export const tenantMasterPageSectionsTable = mysqlTable(
  'master_page_sections',
  {
    id: varchar('id', { length: 36 })
      .primaryKey()
      .default(sql`(UUID())`),

    masterPageId: varchar('master_page_id', { length: 36 }).notNull(),

    sectionType: varchar('section_type', { length: 50 }).notNull(),
    sortOrder: int('sort_order').notNull(),

    sectionData: json('section_data').notNull(),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    masterPageFk: foreignKey({
      name: 'mps_master_page_fk',
      columns: [table.masterPageId],
      foreignColumns: [tenantMasterPagesTable.id],
      onDelete: 'cascade',
    }),
    uniqSectionOrder: uniqueIndex('uniq_master_section_order').on(
      table.masterPageId,
      table.sortOrder,
    ),
    idxMasterSectionType: index('idx_master_section_type').on(
      table.sectionType,
    ),
  }),
);
