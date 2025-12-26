import {
  mysqlTable,
  varchar,
  timestamp,
  boolean,
  foreignKey,
} from 'drizzle-orm/mysql-core';
import { platformServiceTable } from './index';

export const platformServiceFeatureTable = mysqlTable(
  'platform_service_features',
  {
    id: varchar('id', { length: 36 }).primaryKey().default('UUID()'),
    code: varchar('code', { length: 40 }).notNull().unique(), //-- DMT_IMPS, BBPS_GAS
    name: varchar('name', { length: 100 }).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    platformServiceId: varchar('platform_service_id', { length: 36 }).notNull(),

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
