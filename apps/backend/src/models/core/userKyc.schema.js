import {
  mysqlTable,
  timestamp,
  varchar,
  foreignKey,
  uniqueIndex,
  index,
} from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

import { usersTable } from './index';

export const usersKycTable = mysqlTable(
  'users_kyc',
  {
    id: varchar('id', { length: 36 })
      .primaryKey()
      .default(sql`(UUID())`),

    userId: varchar('user_id', { length: 36 }).notNull(),

    verificationStatus: varchar('verification_status', { length: 20 })
      .notNull()
      .default('PENDING'),
    // PENDING | VERIFIED | REJECTED

    submittedByUserId: varchar('submitted_by_user_id', { length: 36 }),
    verifiedByUserId: varchar('verified_by_user_id', { length: 36 }),
    verifiedByEmployeeId: varchar('verified_by_employee_id', { length: 36 }),

    actionedAt: timestamp('actioned_at'),
    actionReason: varchar('action_reason', { length: 500 }),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },

  (table) => ({
    userKycUserFk: foreignKey({
      name: 'uk_user_fk',
      columns: [table.userId],
      foreignColumns: [usersTable.id],
    }),

    userKycSubmittedByUserFk: foreignKey({
      name: 'uk_submitted_by_user_fk',
      columns: [table.submittedByUserId],
      foreignColumns: [usersTable.id],
    }),

    userKycVerifiedByUserFk: foreignKey({
      name: 'uk_verified_by_user_fk',
      columns: [table.verifiedByUserId],
      foreignColumns: [usersTable.id],
    }),

    uniqUserKyc: uniqueIndex('uniq_user_kyc').on(table.userId),

    idxUserKycStatus: index('idx_user_kyc_status').on(table.verificationStatus),
  }),
);
