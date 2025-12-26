import {
  mysqlTable,
  varchar,
  timestamp,
  foreignKey,
} from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

import { usersTable } from './index';

export const departmentTable = mysqlTable(
  'departments',
  {
    id: varchar('id', { length: 36 })
  .primaryKey()
  .default(sql`(UUID())`),

    departmentCode: varchar('department_code', { length: 50 })
      .notNull()
      .unique(),

    departmentName: varchar('department_name', { length: 100 }).notNull(),
    departmentDescription: varchar('department_description', {
      length: 255,
    }),

    createdByUserId: varchar('created_by_user_id', { length: 36 }),
    createdByEmployeeId: varchar('created_by_employee_id', { length: 36 }),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },

  (table) => ({
    departmentCreatedByUserFk: foreignKey({
      name: 'dept_created_by_user_fk',
      columns: [table.createdByUserId],
      foreignColumns: [usersTable.id],
    }),

    departmentCreatedByEmployeeFk: foreignKey({
      name: 'dept_created_by_employee_fk',
      columns: [table.createdByEmployeeId],
      foreignColumns: [usersTable.id],
    }),
  }),
);
