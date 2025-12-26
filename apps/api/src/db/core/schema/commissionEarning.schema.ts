import {
  pgTable,
  uuid,
  timestamp,
  foreignKey,
  pgEnum,
  integer,
} from 'drizzle-orm/pg-core';
import {
  platformServiceFeatureTable,
  platformServiceTable,
  tenantsTable,
  transactionTable,
  usersTable,
  walletTable,
} from './index';

export const commissionTypeEnum = pgEnum('commission_type', [
  'FIXED',
  'PERCENTAGE',
]);

export const surchargeTypeEnum = pgEnum('surcharge_type', [
  'FIXED',
  'PERCENTAGE',
]);

export const commissionEarningTable = pgTable(
  'commission_earnings',
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull(),
    transactionId: uuid('transaction_id').notNull(),
    tenantId: uuid('tenant_id').notNull(),
    platformServiceId: uuid('platform_service_id').notNull(),
    platformServiceFeatureId: uuid('platform_service_feature_id').notNull(),
    walletId: uuid('wallet_id').notNull(),
    commissionType: commissionTypeEnum('commission_type').notNull(),
    commissionValue: integer('commission_value').notNull(),
    commissionAmmount: integer('commission_amount').notNull(),

    surchargeType: surchargeTypeEnum('surcharge_type').notNull(),
    surchargeValue: integer('surcharge_value').notNull(),
    surchargeAmmount: integer('surcharge_amount').notNull(),

    grossAmount: integer('gross_amount').notNull(),
    gstAmmount: integer('gst_amount').notNull(),
    netAmount: integer('net_amount').notNull(),

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
