import {
  pgTable,
  uuid,
  timestamp,
  varchar,
  boolean,
  foreignKey,
} from 'drizzle-orm/pg-core';
import { platformServiceTable } from './index';

export const platformServiceFeatureTable = pgTable(
  'platform_service_features',
  {
    id: uuid().primaryKey().defaultRandom(),
    code: varchar('code', { length: 40 }).notNull().unique(), //-- DMT_IMPS, BBPS_GAS
    name: varchar('name', { length: 100 }).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    platformServiceId: uuid().notNull(),

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
