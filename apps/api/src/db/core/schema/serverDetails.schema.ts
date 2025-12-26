import {
  pgTable,
  uuid,
  timestamp,
  foreignKey,
  varchar,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { usersTable } from './index';

export const serverDetailStatus = pgEnum('server_detail_status', [
  'ACTIVE',
  'INACTIVE',
]);

export const serverDetailTable = pgTable(
  'server_details',
  {
    id: uuid().primaryKey().defaultRandom(),
    recordType: varchar('record_type', { length: 50 }).notNull(),
    hostname: varchar('hostname', { length: 255 }).notNull(),
    value: varchar('value', { length: 45 }).notNull(),
    status: serverDetailStatus().notNull(),
    createdByUserId: uuid('created_by_user_id').notNull(),
    createdByEmployeeId: uuid('created_by_employee_id'),
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
