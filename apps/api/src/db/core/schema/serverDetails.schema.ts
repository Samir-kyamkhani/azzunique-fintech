import {
  mysqlTable,
  varchar,
  timestamp,
  foreignKey,
  text,
} from 'drizzle-orm/mysql-core';
import { usersTable } from './index';

export const serverDetailTable = mysqlTable(
  'server_details',
  {
    id: varchar('id', { length: 36 }).primaryKey().default('UUID()'),
    recordType: varchar('record_type', { length: 50 }).notNull(),
    hostname: varchar('hostname', { length: 255 }).notNull(),
    value: varchar('value', { length: 45 }).notNull(),
    status: text('status', { enum: ['ACTIVE', 'INACTIVE'] })
      .notNull()
      .default('ACTIVE'),
    createdByUserId: varchar('created_by_user_id', { length: 36 }).notNull(),
    createdByEmployeeId: varchar('created_by_employee_id', { length: 36 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },

  (table) => ({
    usersFk: foreignKey({
      columns: [table.createdByUserId],
      foreignColumns: [usersTable.id],
    }),
  }),
);
