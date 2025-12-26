import {
  mysqlTable,
  timestamp,
  varchar,
  boolean,
  foreignKey,
} from 'drizzle-orm/mysql-core';
import { platformServiceTable } from './index';

export const serviceProviderTable = mysqlTable(
  'service_providers',
  {
    id: varchar('id', { length: 36 }).primaryKey().default('UUID()'),
    platformServiceId: varchar('platform_service_id', { length: 36 }).notNull(),
    code: varchar('code', { length: 40 }).notNull().unique(), //-- PAYSPRINT_DMT
    providerName: varchar('provider_name', { length: 100 }).notNull(),
    handler: varchar('handler', { length: 200 }).notNull(),
    isActive: boolean('is_active').default(true).notNull(),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },

  (table) => ({
    platformServiceFk: foreignKey({
      columns: [table.platformServiceId],
      foreignColumns: [platformServiceTable.id],
    }),
  }),
);
