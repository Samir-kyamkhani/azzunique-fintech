import {
  mysqlTable,
  timestamp,
  varchar,
  int,
  boolean,
  foreignKey,
  uniqueIndex,
} from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

import {
  platformServiceFeatureTable,
  platformServiceTable,
  tenantsTable,
  usersTable,
} from './index';

export const userCommissionSettingTable = mysqlTable(
  'user_commission_settings',
  {
    id: varchar('id', { length: 36 })
      .primaryKey()
      .default(sql`(UUID())`),

    tenantId: varchar('tenant_id', { length: 36 }).notNull(),
    platformServiceId: varchar('platform_service_id', { length: 36 }).notNull(),
    platformServiceFeatureId: varchar('platform_service_feature_id', {
      length: 36,
    }).notNull(),
    userId: varchar('user_id', { length: 36 }).notNull(),

    commissionType: varchar('commission_type', { length: 20 }).notNull(),
    // FLAT | PERCENTAGE

    commissionValue: int('commission_value').notNull(),

    surchargeType: varchar('surcharge_type', { length: 20 }).notNull(), // FLAT | PERCENTAGE
    surchargeValue: int('surcharge_value').notNull(),

    gstApplicable: boolean('gst_applicable').default(false).notNull(),
    gstRate: int('gst_rate').default(18).notNull(),
    gstOn: varchar('gst_on', { length: 20 }).notNull(), // COMMISSION | SURCHARGE | BOTH
    gstInclusive: boolean('gst_inclusive').default(false).notNull(),

    maxCommissionValue: int('max_commission_value').default(0).notNull(),
    isActive: boolean('is_active').default(true).notNull(),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },

  (table) => ({
    tenantFk: foreignKey({
      name: 'ucs_tenant_fk',
      columns: [table.tenantId],
      foreignColumns: [tenantsTable.id],
    }),

    platformServiceFk: foreignKey({
      name: 'ucs_platform_service_fk',
      columns: [table.platformServiceId],
      foreignColumns: [platformServiceTable.id],
    }),

    platformServiceFeatureFk: foreignKey({
      name: 'ucs_platform_service_feature_fk',
      columns: [table.platformServiceFeatureId],
      foreignColumns: [platformServiceFeatureTable.id],
    }),

    userFk: foreignKey({
      name: 'ucs_user_fk',
      columns: [table.userId],
      foreignColumns: [usersTable.id],
    }),

    uniqUserCommission: uniqueIndex('uniq_user_commission_setting').on(
      table.tenantId,
      table.userId,
      table.platformServiceFeatureId,
    ),
  }),
);
