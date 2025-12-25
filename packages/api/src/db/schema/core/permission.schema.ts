import {
  pgTable,
  uuid,
  timestamp,
  varchar,
  boolean,
} from 'drizzle-orm/pg-core';

export const permissionTable = pgTable('permissions', {
  id: uuid().primaryKey().defaultRandom(),
  resource: varchar('resource', { length: 100 }).notNull(),
  action: varchar('action', { length: 50 }).notNull(),
  isActive: boolean('is_active').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
