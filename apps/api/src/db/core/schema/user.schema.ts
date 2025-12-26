import {
  mysqlTable,
  timestamp,
  foreignKey,
  varchar,
  text,
} from 'drizzle-orm/mysql-core';
import { roleTable, tenantsTable } from './index';

export const usersTable = mysqlTable(
  'users',
  {
    id: varchar('id', { length: 36 }).primaryKey().default('UUID()'),

    userNumber: varchar('user_number', { length: 30 }).notNull().unique(),
    // generate USER-XXXX in application layer

    firstName: varchar('first_name', { length: 100 }).notNull(),
    lastName: varchar('last_name', { length: 100 }).notNull(),

    email: varchar('email', { length: 255 }).notNull().unique(),
    emailVerifiedAt: timestamp('email_verified_at'),

    mobileNumber: varchar('mobile_number', { length: 20 }).notNull().unique(),

    profilePicture: varchar('profile_picture', { length: 255 }),

    passwordHash: varchar('password_hash', { length: 255 }).notNull(),
    transactionPinHash: varchar('transaction_pin_hash', { length: 255 }),

    userStatus: text('user_status', {
      enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'DELETED'],
    })
      .notNull()
      .default('ACTIVE'),

    isKycVerified: varchar('is_kyc_verified', { length: 5 })
      .notNull()
      .default('false'),
    roleId: varchar('role_id', { length: 36 }).notNull(),

    refreshTokenHash: varchar('refresh_token_hash', { length: 255 }),
    passwordResetTokenHash: varchar('password_reset_token_hash', {
      length: 255,
    }),
    passwordResetTokenExpiry: timestamp('password_reset_token_expiry'),

    actionReason: varchar('action_reason', { length: 500 }),
    actionedAt: timestamp('actioned_at'),
    deletedAt: timestamp('deleted_at'),

    parentId: varchar('parent_id', { length: 36 }),
    createdByEmployeeId: varchar('created_by_employee_id', {
      length: 36,
    }).notNull(),

    tenantId: varchar('tenant_id', { length: 36 }).notNull(),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },

  (table) => ({
    roleFk: foreignKey({
      columns: [table.roleId],
      foreignColumns: [roleTable.id],
    }),

    parentFk: foreignKey({
      columns: [table.parentId],
      foreignColumns: [table.id],
    }),

    tenantFk: foreignKey({
      columns: [table.tenantId],
      foreignColumns: [tenantsTable.id],
    }),
  }),
);
