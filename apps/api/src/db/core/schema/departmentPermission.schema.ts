import {
  mysqlTable,
  timestamp,
  foreignKey,
  varchar,
} from 'drizzle-orm/mysql-core';
import { departmentTable, permissionTable } from './index';

export const departmentPermissionTable = mysqlTable(
  'department_permissions',
  {
    id: varchar('id', { length: 36 }).primaryKey().default('UUID()'),
    departmentId: varchar('department_id', { length: 36 }).notNull(),
    permissionId: varchar('permission_id', { length: 36 }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    departmentFk: foreignKey({
      columns: [table.departmentId],
      foreignColumns: [departmentTable.id],
    }),
    permissionFk: foreignKey({
      columns: [table.permissionId],
      foreignColumns: [permissionTable.id],
    }),
  }),
);
