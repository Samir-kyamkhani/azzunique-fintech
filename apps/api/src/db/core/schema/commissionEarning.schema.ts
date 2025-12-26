import {
  mysqlTable,
  varchar,
  timestamp,
  foreignKey,
  int,
  text,
  uniqueIndex,
  index,
} from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

import {
  platformServiceFeatureTable,
  platformServiceTable,
  tenantsTable,
  transactionTable,
  usersTable,
  walletTable,
} from './index';

export const commissionEarningTable = mysqlTable(
  'commission_earnings',
  {
    id: varchar('id', { length: 36 })
  .primaryKey()
  .default(sql`(UUID())`),

    userId: varchar('user_id', { length: 36 }).notNull(),
    tenantId: varchar('tenant_id', { length: 36 }).notNull(),
    walletId: varchar('wallet_id', { length: 36 }).notNull(),

    transactionId: varchar('transaction_id', {
      length: 36,
    }).notNull(),

    platformServiceId: varchar('platform_service_id', {
      length: 36,
    }).notNull(),

    platformServiceFeatureId: varchar('platform_service_feature_id', {
      length: 36,
    }).notNull(),

    commissionType: text('commission_type', {
      enum: ['FLAT', 'PERCENTAGE'],
    }).notNull(),

    commissionValue: int('commission_value').notNull(),
    commissionAmount: int('commission_amount').notNull(),

    surchargeType: text('surcharge_type', {
      enum: ['FLAT', 'PERCENTAGE'],
    }).notNull(),

    surchargeValue: int('surcharge_value').notNull(),
    surchargeAmount: int('surcharge_amount').notNull(),

    /** settlement math */
    grossAmount: int('gross_amount').notNull(),
    gstAmount: int('gst_amount').notNull(),
    netAmount: int('net_amount').notNull(),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },

  (table) => ({
    ceTenantFk: foreignKey({
      name: 'ce_tenant_fk',
      columns: [table.tenantId],
      foreignColumns: [tenantsTable.id],
    }),

    ceUserFk: foreignKey({
      name: 'ce_user_fk',
      columns: [table.userId],
      foreignColumns: [usersTable.id],
    }),

    ceWalletFk: foreignKey({
      name: 'ce_wallet_fk',
      columns: [table.walletId],
      foreignColumns: [walletTable.id],
    }),

    ceTransactionFk: foreignKey({
      name: 'ce_tx_fk',
      columns: [table.transactionId],
      foreignColumns: [transactionTable.id],
    }),

    cePlatformServiceFk: foreignKey({
      name: 'ce_ps_fk',
      columns: [table.platformServiceId],
      foreignColumns: [platformServiceTable.id],
    }),

    cePlatformServiceFeatureFk: foreignKey({
      name: 'ce_psf_fk',
      columns: [table.platformServiceFeatureId],
      foreignColumns: [platformServiceFeatureTable.id],
    }),

    uniqCommissionEarning: uniqueIndex('uniq_commission_earning').on(
      table.transactionId,
      table.userId,
    ),

    idxCommissionTenant: index('idx_commission_tenant').on(table.tenantId),

    idxCommissionUser: index('idx_commission_user').on(table.userId),

    idxCommissionTransaction: index('idx_commission_transaction').on(
      table.transactionId,
    ),
  }),
);
