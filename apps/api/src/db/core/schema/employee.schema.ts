import {
  foreignKey,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/mysql-core';
import { departmentTable, tenantsTable } from './index';

export const employeesTable = mysqlTable(
  'employees',
  {
    id: varchar('id', { length: 36 }).primaryKey().default('UUID()'),
    employeeNumber: varchar('employee_number', { length: 30 })
      .unique()
      .notNull(), // generate in app, cannot use sequence in MySQL
    firstName: varchar('first_name', { length: 100 }).notNull(),
    lastName: varchar('last_name', { length: 100 }).notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    emailVerifiedAt: timestamp('email_verified_at'),
    mobileNumber: varchar('mobile_number', { length: 20 }).notNull().unique(),
    profilePicture: varchar('profile_picture', { length: 255 }),
    passwordHash: varchar('password_hash', { length: 255 }).notNull(),
    employeeStatus: text('employee_status', {
      enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'],
    })
      .notNull()
      .default('INACTIVE'),
    departmentId: varchar('department_id', { length: 36 }).notNull(),
    refreshTokenHash: varchar('refresh_token_hash', { length: 255 }),
    passwordResetTokenHash: varchar('password_reset_token_hash', {
      length: 255,
    }),
    passwordResetTokenExpiry: timestamp('password_reset_token_expiry'),

    actionReason: varchar('action_reason', { length: 500 }),
    actionedAt: timestamp('actioned_at'),

    tenantId: varchar('tenant_id', { length: 36 }).notNull(),

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
    // No need for raw SQL check, handled by enum option
  }),
);
