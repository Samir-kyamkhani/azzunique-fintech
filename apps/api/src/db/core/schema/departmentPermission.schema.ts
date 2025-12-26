import { pgTable, uuid, timestamp, foreignKey } from 'drizzle-orm/pg-core';
import { departmentTable, permissionTable } from './index';

export const departmentPermissionTable = pgTable(
  'department_permissions',
  {
    id: uuid().primaryKey().defaultRandom(),
    departmentId: uuid('department_id').notNull(),
    permissionId: uuid('permission_id').notNull(),
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
