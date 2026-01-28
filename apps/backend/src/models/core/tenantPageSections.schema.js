import { sql } from 'drizzle-orm';
import {
  foreignKey,
  int,
  mysqlTable,
  varchar,
  json,
  timestamp,
  uniqueIndex,
  index,
} from 'drizzle-orm/mysql-core';
import { tenantMasterPageSectionsTable, tenantPagesTable } from './index.js';

export const tenantPageSectionsTable = mysqlTable(
  'tenant_page_sections',
  {
    id: varchar('id', { length: 36 })
      .primaryKey()
      .default(sql`(UUID())`),

    tenantPageId: varchar('tenant_page_id', { length: 36 }).notNull(),

    sectionType: varchar('section_type', { length: 50 }).notNull(),
    sortOrder: int('sort_order').notNull(),

    sectionData: json('section_data').notNull(),
    sourceMasterSectionId: varchar('source_master_section_id', { length: 36 }),

    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    tenantPageFk: foreignKey({
      name: 'tps_page_fk',
      columns: [table.tenantPageId],
      foreignColumns: [tenantPagesTable.id],
      onDelete: 'cascade',
    }),

    tenantSectionMasterFk: foreignKey({
      name: 'tps_master_section_fk',
      columns: [table.sourceMasterSectionId],
      foreignColumns: [tenantMasterPageSectionsTable.id],
    }),

    uniqTenantSectionOrder: uniqueIndex('uniq_tenant_section_order').on(
      table.tenantPageId,
      table.sortOrder,
    ),

    idxTenantSectionType: index('idx_tenant_section_type').on(
      table.sectionType,
    ),
  }),
);
