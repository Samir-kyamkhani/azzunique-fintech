import {
  mysqlTable,
  timestamp,
  foreignKey,
  varchar,
  uniqueIndex,
} from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

import { platformServiceFeatureTable, serviceProviderTable } from './index.js';

export const serviceProviderFeatureTable = mysqlTable(
  'service_provider_features',
  {
    id: varchar('id', { length: 36 })
  .primaryKey()
  .default(sql`(UUID())`),

    serviceProviderId: varchar('service_provider_id', {
      length: 36,
    }).notNull(),

    platformServiceFeatureId: varchar('platform_service_feature_id', {
      length: 36,
    }).notNull(),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },

  (table) => ({
    spfServiceProviderFk: foreignKey({
      name: 'spf_service_provider_fk',
      columns: [table.serviceProviderId],
      foreignColumns: [serviceProviderTable.id],
    }),

    spfPlatformServiceFeatureFk: foreignKey({
      name: 'spf_platform_service_feature_fk',
      columns: [table.platformServiceFeatureId],
      foreignColumns: [platformServiceFeatureTable.id],
    }),

    uniqServiceProviderFeature: uniqueIndex('uniq_service_provider_feature').on(
      table.serviceProviderId,
      table.platformServiceFeatureId,
    ),
  }),
);
