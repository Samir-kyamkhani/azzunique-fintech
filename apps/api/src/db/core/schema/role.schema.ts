import {
  mysqlTable,
  varchar,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

export const roleTable = mysqlTable(
  'roles',
  {
    id: varchar('id', { length: 36 })
  .primaryKey()
  .default(sql`(UUID())`),

    roleCode: varchar('role_code', { length: 50 }).notNull(),

    roleName: varchar('role_name', { length: 100 }).notNull(),

    roleDescription: varchar('role_description', { length: 255 }),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },

  (table) => ({
    uniqRoleCode: uniqueIndex('uniq_role_code').on(table.roleCode),
  }),
);
