import {
  pgTable,
  uuid,
  timestamp,
  foreignKey,
  varchar,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { tenantsTable, usersTable } from './index';

export const tenantKycVerificationStatus = pgEnum('verification_status', [
  'PENDING',
  'VERIFIED',
  'REJECTED',
]);

export const tenantKycTable = pgTable(
  'tenants_kyc',
  {
    id: uuid().primaryKey().defaultRandom(),

    tenantId: uuid('tenant_id').notNull(),
    verificationStatus: tenantKycVerificationStatus().default('PENDING').notNull(),
    submittedByUserId: uuid('submitted_by_user_id'),
    verifiedByUserId: uuid('verified_by_user_id').notNull(),
    verifiedByEmployeeId: uuid('verified_by_employee_id'),

    actionedAt: timestamp('actioned_at'),
    actionReason: varchar('action_reason', { length: 500 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },

  (table) => ({
    tenantFk: foreignKey({
      columns: [table.tenantId],
      foreignColumns: [tenantsTable.id],
    }),
    submittedByUserIdFk: foreignKey({
      columns: [table.submittedByUserId],
      foreignColumns: [usersTable.id],
    }),
    verifiedByUserIdFk: foreignKey({
      columns: [table.verifiedByUserId],
      foreignColumns: [usersTable.id],
    }),
  }),
);
