import { pgTable, uuid, timestamp, foreignKey } from 'drizzle-orm/pg-core';
import { permissionTable, roleTable } from './index';

export const rolePermissionTable = pgTable(
  'role_permissions',
  {
    id: uuid().primaryKey().defaultRandom(),
    roleId: uuid('role_id').notNull(),
    permissionId: uuid('permission_id').notNull(),
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
