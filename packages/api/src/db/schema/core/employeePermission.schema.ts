import {
  pgTable,
  uuid,
  timestamp,
  foreignKey,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { employeesTable, permissionTable } from './index';

export const employeeEffact = pgEnum('effact', ['ALLOW', 'DENY']);

export const employeePermissionTable = pgTable(
  'employee_permissions',
  {
    id: uuid().primaryKey().defaultRandom(),
    employeeId: uuid('employee_id').notNull(),
    permissionId: uuid('permission_id').notNull(),
    effact: employeeEffact().notNull(),
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
