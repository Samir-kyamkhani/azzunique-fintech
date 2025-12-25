import {
  pgTable,
  uuid,
  timestamp,
  foreignKey,
  varchar,
} from 'drizzle-orm/pg-core';
import { tenantsWebsitesTable } from './index';

export const tenantSocialMediaTable = pgTable(
  'tenants_social_media',
  {
    id: uuid().primaryKey().defaultRandom(),
    facebookUrl: varchar('facebook_url', { length: 1000 }),
    twitterUrl: varchar('twitter_url', { length: 1000 }),
    instagramUrl: varchar('instagram_url', { length: 1000 }),
    linkedInUrl: varchar('linkedin_url', { length: 1000 }),
    youtubeUrl: varchar('youtube_url', { length: 1000 }),

    tenantWebsiteId: uuid('tenant_website_id').notNull(),
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
