import {
  mysqlTable,
  timestamp,
  foreignKey,
  varchar,
  text,
} from 'drizzle-orm/mysql-core';
import { tenantsTable, usersTable } from './index';

export const tenantKycTable = mysqlTable(
  'tenants_kyc',
  {
    id: varchar('id', { length: 36 }).primaryKey().default('UUID()'),

    tenantId: varchar('tenant_id', { length: 36 }).notNull(),

    status: text('status', {
      enum: ['PENDING', 'VERIFIED', 'REJECTED'],
    })
      .notNull()
      .default('PENDING'),

    submittedByUserId: varchar('submitted_by_user_id', { length: 36 }),
    verifiedByUserId: varchar('verified_by_user_id', { length: 36 }),
    verifiedByEmployeeId: varchar('verified_by_employee_id', { length: 36 }),

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

    submittedByUserFk: foreignKey({
      columns: [table.submittedByUserId],
      foreignColumns: [usersTable.id],
    }),

    verifiedByUserFk: foreignKey({
      columns: [table.verifiedByUserId],
      foreignColumns: [usersTable.id],
    }),
  }),
);
