import {
  mysqlTable,
  timestamp,
  foreignKey,
  varchar,
} from 'drizzle-orm/mysql-core';
import { tenantsWebsitesTable } from './index';

export const tenantSocialMediaTable = mysqlTable(
  'tenants_social_media',
  {
    id: varchar('id', { length: 36 }).primaryKey().default('UUID()'),

    tenantWebsiteId: varchar('tenant_website_id', { length: 36 }).notNull(),

    facebookUrl: varchar('facebook_url', { length: 1000 }),
    twitterUrl: varchar('twitter_url', { length: 1000 }),
    instagramUrl: varchar('instagram_url', { length: 1000 }),
    linkedInUrl: varchar('linkedin_url', { length: 1000 }),
    youtubeUrl: varchar('youtube_url', { length: 1000 }),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },

  (table) => ({
    tenantWebsiteFk: foreignKey({
      columns: [table.tenantWebsiteId],
      foreignColumns: [tenantsWebsitesTable.id],
    }),
  }),
);
