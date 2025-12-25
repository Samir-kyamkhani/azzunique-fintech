import {
  pgTable,
  uuid,
  timestamp,
  foreignKey,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { permissionTable, usersTable } from './index';

export const userEffact = pgEnum('effact', ['ALLOW', 'DENY']);

export const userPermissionTable = pgTable(
  'user_permissions',
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull(),
    permissionId: uuid('permission_id').notNull(),
    effact: userEffact().notNull(),
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
