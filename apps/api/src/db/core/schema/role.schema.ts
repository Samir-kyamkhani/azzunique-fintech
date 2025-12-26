import { mysqlTable, varchar, timestamp } from 'drizzle-orm/mysql-core';

export const roleTable = mysqlTable('roles', {
  id: varchar('id', { length: 36 }).primaryKey().default('UUID()'),
  roleCode: varchar('role_code', { length: 50 }).notNull().unique(),
  roleName: varchar('role_name', { length: 100 }).notNull(),
  roleDescription: varchar('role_description', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
