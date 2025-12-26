import {
  pgTable,
  uuid,
  timestamp,
  foreignKey,
  varchar,
  pgEnum,
  boolean,
} from 'drizzle-orm/pg-core';
import { tenantsTable, usersTable } from './index';

export const bankDetailVerificationStatus = pgEnum('verification_status', [
  'PENDING',
  'VERIFIED',
  'REJECTED',
]);


export const bankDetailTable = pgTable(
  'tenants_bank_detail',
  {
    id: uuid().primaryKey().defaultRandom(),
    bankName: varchar('bank_name', { length: 255 }).notNull(),
    accountHolderName: varchar('account_holder_name', {
      length: 255,
    }).notNull(),
    accountNumber: varchar('account_number', { length: 255 }).notNull(),
    ifscCode: varchar('ifsc_code', { length: 255 }).notNull(),
    branchName: varchar('branch_name', { length: 255 }).notNull(),
    isPrimary: boolean('is_primary').default(false).notNull(),
    bankProofDocumentUrl: varchar('bank_proof_document_url', {
      length: 500,
    }).notNull(),
    verificationStatus: bankDetailVerificationStatus().default('PENDING').notNull(),

    ownerId: uuid('owner_id').notNull(), // userid both tenant and user
    tenantId: uuid('tenant_id').notNull(),

    submittedByEmployeeId: uuid('submitted_by_employee_id'),
    verifiedByUserId: uuid('verified_by_user_id').notNull(),
    verifiedByEmployeeId: uuid('verified_by_employee_id'),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },

  (table) => ({
    tenantFk: foreignKey({
      columns: [table.tenantId],
      foreignColumns: [tenantsTable.id],
    }),
    ownerIdFk: foreignKey({
      columns: [table.ownerId],
      foreignColumns: [usersTable.id],
    }),
    verifiedByUserIdFk: foreignKey({
      columns: [table.verifiedByUserId],
      foreignColumns: [usersTable.id],
    }),
  }),
);
