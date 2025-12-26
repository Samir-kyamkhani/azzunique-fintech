import {
  pgTable,
  uuid,
  timestamp,
  varchar,
  boolean,
} from 'drizzle-orm/pg-core';

export const platformServiceTable = pgTable('platform_services', {
  id: uuid().primaryKey().defaultRandom(),
  code: varchar('code', { length: 40 }).notNull().unique(), //-- DMT, BBPS
  name: varchar('name', { length: 100 }).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
