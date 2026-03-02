import {
  mysqlTable,
  varchar,
  timestamp,
  foreignKey,
  uniqueIndex,
  index,
  bigint,
} from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

import {
  platformServiceFeatureTable,
  platformServiceTable,
  tenantsTable,
  transactionTable,
  usersTable,
  walletTable,
} from './index.js';

export const commissionEarningTable = mysqlTable(
  'commission_earnings',
  {
    id: varchar('id', { length: 36 })
      .primaryKey()
      .default(sql`(UUID())`),

    userId: varchar('user_id', { length: 36 }).notNull(),
    tenantId: varchar('tenant_id', { length: 36 }).notNull(),
    walletId: varchar('wallet_id', { length: 36 }).notNull(),
    transactionId: varchar('transaction_id', { length: 36 }).notNull(),

    platformServiceId: varchar('platform_service_id', {
      length: 36,
    }).notNull(),

    platformServiceFeatureId: varchar('platform_service_feature_id', {
      length: 36,
    }).notNull(),

    mode: varchar('mode', { length: 20 }).notNull(),
    type: varchar('type', { length: 20 }).notNull(),

    value: bigint('value', { mode: 'number' }).notNull(),

    baseAmount: bigint('base_amount', { mode: 'number' }).notNull(),
    gstAmount: bigint('gst_amount', { mode: 'number' }).notNull(),
    tdsAmount: bigint('tds_amount', { mode: 'number' }).notNull(),
    finalAmount: bigint('final_amount', { mode: 'number' }).notNull(),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    /* UNIQUE (Idempotency Lock) */
    uniqCommission: uniqueIndex('uniq_commission').on(
      table.transactionId,
      table.userId,
    ),

    /* FOREIGN KEYS */
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

    /* INDEXES */
    idxCommissionTenant: index('idx_commission_tenant').on(table.tenantId),

    idxCommissionUser: index('idx_commission_user').on(table.userId),

    idxCommissionTransaction: index('idx_commission_transaction').on(
      table.transactionId,
    ),
  }),
);
