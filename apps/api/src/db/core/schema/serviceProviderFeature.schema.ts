import { mysqlTable, timestamp, foreignKey } from 'drizzle-orm/mysql-core';
import { platformServiceFeatureTable, serviceProviderTable } from './index';
import { varchar } from 'drizzle-orm/mysql-core';

export const serviceProviderFeatureTable = mysqlTable(
  'service_provider_features',
  {
    id: varchar('id', { length: 36 }).primaryKey().default('UUID()'),
    serviceProviderId: varchar('service_provider_id', { length: 36 }).notNull(),
    platformServiceFeatureId: varchar('platform_service_feature_id', {
      length: 36,
    }).notNull(),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },

  (table) => ({
    serviceProviderFk: foreignKey({
      columns: [table.serviceProviderId],
      foreignColumns: [serviceProviderTable.id],
    }),
    platformServiceFeatureFk: foreignKey({
      columns: [table.platformServiceFeatureId],
      foreignColumns: [platformServiceFeatureTable.id],
    }),
  }),
);
