import {
  foreignKey,
  pgEnum,
  pgSequence,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { departmentTable, tenantsTable } from './index';

export const employeeStatus = pgEnum('employee_status', [
  'ACTIVE',
  'INACTIVE',
  'SUSPENDED',
]);

export const employeeNumberSeq = pgSequence('employee_number_seq');

export const employeesTable = pgTable(
  'employees',
  {
    id: uuid().primaryKey().defaultRandom(),
    employeeNumber: varchar('employee_number', { length: 30 })
      .unique()
      .default(sql`'EMP-' || nextval('employee_number_seq')`)
      .notNull(),
    firstName: varchar('first_name', { length: 100 }).notNull(),
    lastName: varchar('last_name', { length: 100 }).notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    emailVerifiedAt: varchar('email_verified_at', { length: 255 }),
    mobileNumber: varchar('mobile_number', { length: 20 }).notNull().unique(),
    profilePicture: varchar('profile_picture', { length: 255 }),
    passwordHash: varchar('password_hash', { length: 255 }).notNull(),
    employeeStatus: employeeStatus().notNull(),

    departmentId: uuid('department_id').notNull().unique(),
    refreshTokenHash: varchar('refresh_token_hash', { length: 255 }),
    passwordResetTokenHash: varchar('password_reset_token_hash', {
      length: 255,
    }),
    passwordResetTokenExpiry: timestamp('password_reset_token_expiry'),

    actionReason: varchar('action_reason', { length: 500 }),
    actionedAt: timestamp('actioned_at'),

    tenantId: uuid('tenant_id').notNull(),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    departmentFk: foreignKey({
      columns: [table.departmentId],
      foreignColumns: [departmentTable.id],
    }),
    tenantFk: foreignKey({
      columns: [table.tenantId],
      foreignColumns: [tenantsTable.id],
    }),
  }),
);
