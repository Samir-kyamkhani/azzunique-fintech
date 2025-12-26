import {
  mysqlTable,
  varchar,
  timestamp,
  boolean,
} from 'drizzle-orm/mysql-core';

export const permissionTable = mysqlTable('permissions', {
  id: varchar('id', { length: 36 }).primaryKey().default('UUID()'),
  resource: varchar('resource', { length: 100 }).notNull(),
  action: varchar('action', { length: 50 }).notNull(),
  isActive: boolean('is_active').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
