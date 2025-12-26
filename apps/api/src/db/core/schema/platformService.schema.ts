import {
  mysqlTable,
  varchar,
  timestamp,
  boolean,
} from 'drizzle-orm/mysql-core';

export const platformServiceTable = mysqlTable('platform_services', {
  id: varchar('id', { length: 36 }).primaryKey().default('UUID()'),
  code: varchar('code', { length: 40 }).notNull().unique(), //-- DMT, BBPS
  name: varchar('name', { length: 100 }).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
