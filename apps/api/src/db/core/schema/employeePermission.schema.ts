import {
  mysqlTable,
  varchar,
  timestamp,
  foreignKey,
  text,
} from 'drizzle-orm/mysql-core';
import { employeesTable, permissionTable } from './index';

export const employeePermissionTable = mysqlTable(
  'employee_permissions',
  {
    id: varchar('id', { length: 36 }).primaryKey().default('UUID()'),
    employeeId: varchar('employee_id', { length: 36 }).notNull(),
    permissionId: varchar('permission_id', { length: 36 }).notNull(),
    effact: text('effact', { enum: ['ALLOW', 'DENY'] })
      .notNull()
      .default('ALLOW'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    employeeFk: foreignKey({
      columns: [table.employeeId],
      foreignColumns: [employeesTable.id],
    }),
    permissionFk: foreignKey({
      columns: [table.permissionId],
      foreignColumns: [permissionTable.id],
    }),
  }),
);
