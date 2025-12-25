import {
  pgTable,
  uuid,
  timestamp,
  foreignKey,
  varchar,
  jsonb,
} from 'drizzle-orm/pg-core';
import { tenantsTable, usersTable } from './index';

export const auditLogTable = pgTable(
  'audit_log',
  {
    id: uuid().primaryKey().defaultRandom(),
    entityType: varchar('entity_type', { length: 100 }).notNull(),
    entityId: uuid().notNull(),
    action: varchar('action', { length: 100 }).notNull(),
    oldData: jsonb('old_data'),
    newData: jsonb('new_data'),
    performByUserId: uuid().notNull(),
    performByEmployeeId: uuid(),
    ipAddress: varchar('ip_address', { length: 45 }),
    userAgent: varchar('user_agent', { length: 500 }),
    tenantId: uuid().notNull(),
    metaData: jsonb('meta_data'),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },

  (table) => ({
    userIdFk: foreignKey({
      columns: [table.performByUserId],
      foreignColumns: [usersTable.id],
    }),
    tenantIdFk: foreignKey({
      columns: [table.tenantId],
      foreignColumns: [tenantsTable.id],
    }),
  }),
);
