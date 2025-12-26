import {
  pgTable,
  uuid,
  timestamp,
  foreignKey,
  varchar,
} from 'drizzle-orm/pg-core';
import { tenantsTable } from './index';

export const tenantsWebsitesTable = pgTable(
  'tenants_websites',
  {
    id: uuid().primaryKey().defaultRandom(),
    brandName: varchar('brand_name', { length: 255 }).notNull(),
    tagLine: varchar('tag_line', { length: 500 }),
    logoUrl: varchar('logo_url', { length: 1000 }),
    favIconUrl: varchar('fav_icon_url', { length: 1000 }),
    primaryColor: varchar('primary_color', { length: 7 }),
    secondaryColor: varchar('secondary_color', { length: 7 }),
    supportEmail: varchar('support_email', { length: 255 }),
    supportPhone: varchar('support_phone', { length: 20 }),

    tenantId: uuid('tenant_id').notNull(),
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
