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
import { roleTable, tenantsTable } from './index';

export const userStatus = pgEnum('user_status', [
  'ACTIVE',
  'INACTIVE',
  'SUSPENDED',
  'DELETED',
]);

export const userNumberSeq = pgSequence('user_number_seq');

export const usersTable = pgTable(
  'users',
  {
    id: uuid().primaryKey().defaultRandom(),
    userNumber: varchar('user_number', { length: 30 })
      .unique()
      .default(sql`'USER-' || nextval('user_number_seq')`)
      .notNull(),
    firstName: varchar('first_name', { length: 100 }).notNull(),
    lastName: varchar('last_name', { length: 100 }).notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    emailVerifiedAt: varchar('email_verified_at', { length: 255 }),
    mobileNumber: varchar('mobile_number', { length: 20 }).notNull().unique(),
    profilePicture: varchar('profile_picture', { length: 255 }),
    passwordHash: varchar('password_hash', { length: 255 }).notNull(),
    transactionPinHash: varchar('transaction_pin_hash', { length: 255 }),
    userStatus: userStatus().notNull(),
    isKycVerified: varchar('is_kyc_verified', { length: 5 })
      .notNull()
      .default('false'),
    roleId: uuid('role_id').notNull().unique(),
    refreshTokenHash: varchar('refresh_token_hash', { length: 255 }),
    passwordResetTokenHash: varchar('password_reset_token_hash', {
      length: 255,
    }),
    passwordResetTokenExpiry: timestamp('password_reset_token_expiry'),

    actionReason: varchar('action_reason', { length: 500 }),
    actionedAt: timestamp('actioned_at'),
    deletedAt: timestamp('deleted_at'),

    parentId: uuid('parent_id'),
    createdByEmployeeId: uuid('created_by_employee_id').notNull(),
    tenantId: uuid('tenant_id').notNull(),

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
