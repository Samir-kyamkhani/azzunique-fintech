import {
  foreignKey,
  mysqlTable,
  text,
  timestamp,
  varchar,
  index,
} from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

import { departmentTable, tenantsTable } from './index';

export const employeesTable = mysqlTable(
  'employees',
  {
    id: varchar('id', { length: 36 })
  .primaryKey()
  .default(sql`(UUID())`),

    employeeNumber: varchar('employee_number', { length: 30 })
      .notNull()
      .unique(), // generated in app (MySQL-safe)

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
    employeeDepartmentFk: foreignKey({
      name: 'emp_department_fk',
      columns: [table.departmentId],
      foreignColumns: [departmentTable.id],
    }),

    employeeTenantFk: foreignKey({
      name: 'emp_tenant_fk',
      columns: [table.tenantId],
      foreignColumns: [tenantsTable.id],
    }),

    idxEmployeeTenantStatus: index('idx_emp_tenant_status').on(
      table.tenantId,
      table.employeeStatus,
    ),

    idxEmployeeDepartment: index('idx_emp_department').on(table.departmentId),
  }),
);
