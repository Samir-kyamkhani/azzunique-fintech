import {
  mysqlTable,
  timestamp,
  foreignKey,
  varchar,
} from 'drizzle-orm/mysql-core';
import { tenantsTable } from './index';

export const tenantsWebsitesTable = mysqlTable(
  'tenants_websites',
  {
    id: varchar('id', { length: 36 }).primaryKey().default('UUID()'),

    tenantId: varchar('tenant_id', { length: 36 }).notNull(),

    brandName: varchar('brand_name', { length: 255 }).notNull(),
    tagLine: varchar('tag_line', { length: 500 }),
    logoUrl: varchar('logo_url', { length: 1000 }),
    favIconUrl: varchar('fav_icon_url', { length: 1000 }),

    primaryColor: varchar('primary_color', { length: 7 }),
    secondaryColor: varchar('secondary_color', { length: 7 }),

    supportEmail: varchar('support_email', { length: 255 }),
    supportPhone: varchar('support_phone', { length: 20 }),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },

  (table) => ({
    tenantFk: foreignKey({
      columns: [table.tenantId],
      foreignColumns: [tenantsTable.id],
    }),
  }),
);
