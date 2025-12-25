import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  foreignKey,
} from 'drizzle-orm/pg-core';
import { usersTable } from './index';

export const departmentTable = pgTable(
  'departments',
  {
    id: uuid().primaryKey().defaultRandom(),
    departmentCode: varchar('department_code', { length: 50 })
      .notNull()
      .unique(),
    departmentName: varchar('department_name', { length: 100 }).notNull(),
    departmentDescription: varchar('department_description', { length: 255 }),
    createdByUserId: uuid('created_by_user_id'),
    createdbyEmployeeId: uuid('created_by_employee_id'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    userFk: foreignKey({
      columns: [table.createdByUserId],
      foreignColumns: [usersTable.id],
    }),
    employeeFk: foreignKey({
      columns: [table.createdbyEmployeeId],
      foreignColumns: [usersTable.id],
    }),
  }),
);
