import {
  mysqlTable,
  timestamp,
  foreignKey,
  varchar,
  boolean,
  uniqueIndex,
  index,
} from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

import { roleTable, tenantsTable } from './index.js';

export const usersTable = mysqlTable(
  'users',
  {
    id: varchar('id', { length: 36 })
      .primaryKey()
      .default(sql`(UUID())`),

    userNumber: varchar('user_number', { length: 30 }).notNull(),

    firstName: varchar('first_name', { length: 100 }).notNull(),
    lastName: varchar('last_name', { length: 100 }).notNull(),

    email: varchar('email', { length: 255 }).notNull(),
    emailVerifiedAt: timestamp('email_verified_at'),

    mobileNumber: varchar('mobile_number', { length: 20 }).notNull(),

    profilePicture: varchar('profile_picture', { length: 255 }),

    passwordHash: varchar('password_hash', { length: 255 }).notNull(),
    transactionPinHash: varchar('transaction_pin_hash', { length: 255 }),

    userStatus: varchar('user_status', { length: 20 })
      .notNull()
      .default('INACTIVE'),

    isKycVerified: boolean('is_kyc_verified').notNull().default(false),

    roleId: varchar('role_id', { length: 36 }).notNull(),

    refreshTokenHash: varchar('refresh_token_hash', { length: 255 }),
    passwordResetTokenHash: varchar('password_reset_token_hash', {
      length: 255,
    }),
    passwordResetTokenExpiry: timestamp('password_reset_token_expiry').default(
      null,
    ),

    actionReason: varchar('action_reason', { length: 500 }),
    actionedAt: timestamp('actioned_at'),
    deletedAt: timestamp('deleted_at'),

    parentId: varchar('parent_id', { length: 36 }),

    createdByEmployeeId: varchar('created_by_employee_id', {
      length: 36,
    }),

    tenantId: varchar('tenant_id', { length: 36 }).notNull(),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },

  (table) => ({
    userRoleFk: foreignKey({
      name: 'user_role_fk',
      columns: [table.roleId],
      foreignColumns: [roleTable.id],
    }),

    userParentFk: foreignKey({
      name: 'user_parent_fk',
      columns: [table.parentId],
      foreignColumns: [table.id],
    }),

    userTenantFk: foreignKey({
      name: 'user_tenant_fk',
      columns: [table.tenantId],
      foreignColumns: [tenantsTable.id],
    }),

    uniqUserNumber: uniqueIndex('uniq_user_number').on(table.userNumber),

    uniqUserEmail: uniqueIndex('uniq_user_email').on(
      table.tenantId,
      table.email,
    ),

    uniqUserMobile: uniqueIndex('uniq_user_mobile').on(table.mobileNumber),

    idxUserTenantStatus: index('idx_user_tenant_status').on(
      table.tenantId,
      table.userStatus,
    ),

    idxUserParent: index('idx_user_parent').on(table.parentId),
  }),
);
