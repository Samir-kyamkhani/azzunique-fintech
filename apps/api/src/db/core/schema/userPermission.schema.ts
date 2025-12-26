import {
  mysqlTable,
  timestamp,
  varchar,
  text,
  foreignKey,
} from 'drizzle-orm/mysql-core';
import { permissionTable, usersTable } from './index';

export const userPermissionTable = mysqlTable(
  'user_permissions',
  {
    id: varchar('id', { length: 36 }).primaryKey().default('UUID()'),

    userId: varchar('user_id', { length: 36 }).notNull(),
    permissionId: varchar('permission_id', { length: 36 }).notNull(),

    effact: text('effact', {
      enum: ['ALLOW', 'DENY'],
    })
      .notNull()
      .default('ALLOW'),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },

  (table) => ({
    userFk: foreignKey({
      columns: [table.userId],
      foreignColumns: [usersTable.id],
    }),
    permissionFk: foreignKey({
      columns: [table.permissionId],
      foreignColumns: [permissionTable.id],
    }),
  }),
);
