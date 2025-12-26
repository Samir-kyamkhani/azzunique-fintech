import {
  pgTable,
  uuid,
  timestamp,
  foreignKey,
  boolean,
  jsonb,
} from 'drizzle-orm/pg-core';
import {
  platformServiceTable,
  serviceProviderTable,
  tenantsTable,
} from './index';

export const tenantServiceProviderTable = pgTable(
  'tenant_service_providers',
  {
    id: uuid().primaryKey().defaultRandom(),
    tenantId: uuid().notNull(),
    platformServiceId: uuid().notNull(),
    serviceProviderId: uuid().notNull(),
    config: jsonb('config').notNull(), // Configuration specific to the tenant and service provider
    isActive: boolean('is_enabled').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },

  (table) => ({
    tenantFk: foreignKey({
      columns: [table.tenantId],
      foreignColumns: [tenantsTable.id],
    }),
    platformServiceFk: foreignKey({
      columns: [table.platformServiceId],
      foreignColumns: [platformServiceTable.id],
    }),
    serviceProviderFk: foreignKey({
      columns: [table.serviceProviderId],
      foreignColumns: [serviceProviderTable.id],
    }),
  }),
);
