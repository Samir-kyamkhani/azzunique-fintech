import { pgTable, uuid, timestamp, foreignKey } from 'drizzle-orm/pg-core';
import { platformServiceFeatureTable, serviceProviderTable } from './index';

export const serviceProviderFeatureTable = pgTable(
  'service_provider_features',
  {
    id: uuid().primaryKey().defaultRandom(),
    serviceProviderId: uuid().notNull(),
    platformServiceFeatureId: uuid().notNull(),

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
