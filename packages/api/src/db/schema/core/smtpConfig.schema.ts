import {
  pgTable,
  uuid,
  timestamp,
  foreignKey,
  varchar,
} from 'drizzle-orm/pg-core';
import { tenantsTable, usersTable } from './index';

export const smtpConfigTable = pgTable(
  'tenants_smtp_config',
  {
    id: uuid().primaryKey().defaultRandom(),
    smtpHost: varchar('smtp_host', { length: 255 }).notNull(),
    smtpPort: varchar('smtp_port', { length: 10 }).notNull(),
    smtpUsername: varchar('smtp_username', { length: 255 }).notNull(),
    smtpPassword: varchar('smtp_password', { length: 255 }).notNull(),
    encryptionType: varchar('encryption_type', { length: 50 }),
    fromName: varchar('from_name', { length: 255 }).notNull(),
    fromEmail: varchar('from_email', { length: 255 }).notNull(),

    createdByUserId: uuid('created_by_user_id').notNull(),
    createdByEmployeeId: uuid('created_by_employee_id'),
    tenantId: uuid('tenant_id').notNull(),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },

  (table) => ({
    tenantFk: foreignKey({
      columns: [table.tenantId],
      foreignColumns: [tenantsTable.id],
    }),
    userFk: foreignKey({
      columns: [table.createdByUserId],
      foreignColumns: [usersTable.id],
    }),
  }),
);
