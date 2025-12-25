import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';

export const roleTable = pgTable('roles', {
  id: uuid().primaryKey().defaultRandom(),
  roleCode: varchar('role_code', { length: 50 }).notNull().unique(),
  roleName: varchar('role_name', { length: 100 }).notNull(),
  roleDescription: varchar('role_description', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
