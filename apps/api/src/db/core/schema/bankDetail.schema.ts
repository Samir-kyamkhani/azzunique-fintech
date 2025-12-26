import {
  mysqlTable,
  timestamp,
  foreignKey,
  varchar,
  boolean,
  text,
} from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

import { tenantsTable, usersTable } from './index';

export const bankDetailTable = mysqlTable(
  'tenants_bank_detail',
  {
    id: varchar('id', { length: 36 })
  .primaryKey()
  .default(sql`(UUID())`),

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

    verificationStatus: text('verification_status', {
      enum: ['PENDING', 'VERIFIED', 'REJECTED'],
    })
      .notNull()
      .default('PENDING'),

    ownerId: varchar('owner_id', { length: 36 }).notNull(),
    tenantId: varchar('tenant_id', { length: 36 }).notNull(),

    submittedByEmployeeId: varchar('submitted_by_employee_id', {
      length: 36,
    }),
    verifiedByUserId: varchar('verified_by_user_id', {
      length: 36,
    }).notNull(),
    verifiedByEmployeeId: varchar('verified_by_employee_id', {
      length: 36,
    }),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },

  (table) => ({
    bankTenantFk: foreignKey({
      name: 'bank_tenant_fk',
      columns: [table.tenantId],
      foreignColumns: [tenantsTable.id],
    }),

    bankOwnerUserFk: foreignKey({
      name: 'bank_owner_user_fk',
      columns: [table.ownerId],
      foreignColumns: [usersTable.id],
    }),

    bankVerifiedByUserFk: foreignKey({
      name: 'bank_verified_by_user_fk',
      columns: [table.verifiedByUserId],
      foreignColumns: [usersTable.id],
    }),
  }),
);
