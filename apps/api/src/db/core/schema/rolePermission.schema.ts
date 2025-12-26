import { mysqlTable, timestamp, foreignKey } from 'drizzle-orm/mysql-core';
import { permissionTable, roleTable } from './index';
import { varchar } from 'drizzle-orm/mysql-core';

export const rolePermissionTable = mysqlTable(
  'role_permissions',
  {
    id: varchar('id', { length: 36 }).primaryKey().default('UUID()'),
    roleId: varchar('role_id', { length: 36 }).notNull(),
    permissionId: varchar('permission_id', { length: 36 }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    roleFk: foreignKey({
      columns: [table.roleId],
      foreignColumns: [roleTable.id],
    }),
    permissionFk: foreignKey({
      columns: [table.permissionId],
      foreignColumns: [permissionTable.id],
    }),
  }),
);
