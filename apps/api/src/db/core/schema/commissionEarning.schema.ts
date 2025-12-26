import {
  mysqlTable,
  varchar,
  timestamp,
  foreignKey,
  int,
  text,
} from 'drizzle-orm/mysql-core';
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
    id: varchar('id', { length: 36 }).primaryKey().default('UUID()'),
    userId: varchar('user_id', { length: 36 }).notNull(),
    transactionId: varchar('transaction_id', { length: 36 }).notNull(),
    tenantId: varchar('tenant_id', { length: 36 }).notNull(),
    platformServiceId: varchar('platform_service_id', { length: 36 }).notNull(),
    platformServiceFeatureId: varchar('platform_service_feature_id', {
      length: 36,
    }).notNull(),
    walletId: varchar('wallet_id', { length: 36 }).notNull(),

    commissionType: text('commission_type', {
      enum: ['FIXED', 'PERCENTAGE'],
    })
      .notNull()
      .default('FIXED'),
    commissionValue: int('commission_value').notNull(),
    commissionAmount: int('commission_amount').notNull(),

    surchargeType: text('surcharge_type', {
      enum: ['FIXED', 'PERCENTAGE'],
    })
      .notNull()
      .default('FIXED'),
    surchargeValue: int('surcharge_value').notNull(),
    surchargeAmount: int('surcharge_amount').notNull(),

    grossAmount: int('gross_amount').notNull(),
    gstAmount: int('gst_amount').notNull(),
    netAmount: int('net_amount').notNull(),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    tenantFk: foreignKey({
      columns: [table.tenantId],
      foreignColumns: [tenantsTable.id],
    }),
    platformServiceFk: foreignKey({
      columns: [table.platformServiceId],
      foreignColumns: [platformServiceTable.id],
    }),
    platformServiceFeatureFk: foreignKey({
      columns: [table.platformServiceFeatureId],
      foreignColumns: [platformServiceFeatureTable.id],
    }),
    userFk: foreignKey({
      columns: [table.userId],
      foreignColumns: [usersTable.id],
    }),
    transactionFk: foreignKey({
      columns: [table.transactionId],
      foreignColumns: [transactionTable.id],
    }),
    walletFk: foreignKey({
      columns: [table.walletId],
      foreignColumns: [walletTable.id],
    }),
  }),
);
