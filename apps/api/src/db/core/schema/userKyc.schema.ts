import {
  mysqlTable,
  timestamp,
  varchar,
  text,
  foreignKey,
} from 'drizzle-orm/mysql-core';
import { usersTable } from './index';

export const usersKycTable = mysqlTable(
  'users_kyc',
  {
    id: varchar('id', { length: 36 }).primaryKey().default('UUID()'),

    verificationStatus: text('verification_status', {
      enum: ['PENDING', 'VERIFIED', 'REJECTED'],
    })
      .notNull()
      .default('PENDING'),

    submittedByUserId: varchar('submitted_by_user_id', { length: 36 }),
    verifiedByUserId: varchar('verified_by_user_id', { length: 36 }).notNull(),
    verifiedByEmployeeId: varchar('verified_by_employee_id', { length: 36 }),

    actionedAt: timestamp('actioned_at'),
    actionReason: varchar('action_reason', { length: 500 }),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },

  (table) => ({
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
