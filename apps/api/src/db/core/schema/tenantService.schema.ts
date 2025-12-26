import {
  pgTable,
  uuid,
  timestamp,
  foreignKey,
  boolean,
} from 'drizzle-orm/pg-core';
import { platformServiceTable, tenantsTable } from './index';

export const tenantServiceTable = pgTable(
  'tenant_services',
  {
    id: uuid().primaryKey().defaultRandom(),
    tenantId: uuid().notNull(),
    platformServiceId: uuid().notNull(),
    isEnabled: boolean('is_enabled').default(true).notNull(),
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
  }),
);
