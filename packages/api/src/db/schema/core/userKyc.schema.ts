import {
  pgTable,
  uuid,
  timestamp,
  foreignKey,
  varchar,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { usersTable } from './index';

export const verificationStatus = pgEnum('verification_status', [
  'PENDING',
  'VERIFIED',
  'REJECTED',
]);

export const usersKycTable = pgTable(
  'users_kyc',
  {
    id: uuid().primaryKey().defaultRandom(),

    verificationStatus: verificationStatus().default('PENDING').notNull(),
    submittedByUserId: uuid('submitted_by_user_id'),
    verifiedByUserId: uuid('verified_by_user_id').notNull(),
    verifiedByEmployeeId: uuid('verified_by_employee_id'),

    actionedAt: timestamp('actioned_at'),
    actionReason: varchar('action_reason', { length: 500 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },

  (table) => ({
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
