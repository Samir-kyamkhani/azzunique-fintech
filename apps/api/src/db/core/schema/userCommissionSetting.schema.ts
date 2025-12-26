import {
  mysqlTable,
  timestamp,
  varchar,
  text,
  int,
  boolean,
  foreignKey,
} from 'drizzle-orm/mysql-core';
import {
  platformServiceFeatureTable,
  platformServiceTable,
  tenantsTable,
  usersTable,
} from './index';

export const userCommissionSettingTable = mysqlTable(
  'user_commission_settings',
  {
    id: varchar('id', { length: 36 }).primaryKey().default('UUID()'),

    tenantId: varchar('tenant_id', { length: 36 }).notNull(),
    platformServiceId: varchar('platform_service_id', { length: 36 }).notNull(),
    platformServiceFeatureId: varchar('platform_service_feature_id', {
      length: 36,
    }).notNull(),
    userId: varchar('user_id', { length: 36 }).notNull(),

    commissionType: text('commission_type', {
      enum: ['FLAT', 'PERCENTAGE'],
    }).notNull(),
    commissionValue: int('commission_value').notNull(),

    surchargeType: text('surcharge_type', {
      enum: ['FLAT', 'PERCENTAGE'],
    }).notNull(),
    surchargeValue: int('surcharge_value').notNull(),

    gstApplicable: boolean('gst_applicable').default(false).notNull(),
    gstRate: int('gst_rate').default(18).notNull(),
    gstOn: text('gst_on', {
      enum: ['COMMISSION', 'SURCHARGE', 'BOTH'],
    }).notNull(),
    gstInclusive: boolean('gst_inclusive').default(false).notNull(),

    maxCommissionValue: int('max_commission_value').default(0).notNull(),
    isActive: boolean('is_active').default(true).notNull(),

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
  }),
);
