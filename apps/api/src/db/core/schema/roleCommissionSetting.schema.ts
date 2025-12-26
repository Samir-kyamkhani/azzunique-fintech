import {
  mysqlTable,
  varchar,
  timestamp,
  text,
  int,
  boolean,
  foreignKey,
  uniqueIndex,
  index,
} from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

import {
  platformServiceFeatureTable,
  platformServiceTable,
  tenantsTable,
  roleTable,
} from './index';

export const roleCommissionSettingTable = mysqlTable(
  'role_commission_settings',
  {
    id: varchar('id', { length: 36 })
  .primaryKey()
  .default(sql`(UUID())`),

    tenantId: varchar('tenant_id', { length: 36 }).notNull(),
    platformServiceId: varchar('platform_service_id', {
      length: 36,
    }).notNull(),
    platformServiceFeatureId: varchar('platform_service_feature_id', {
      length: 36,
    }).notNull(),
    roleId: varchar('role_id', { length: 36 }).notNull(),

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
    /** FKs */
    rcsTenantFk: foreignKey({
      name: 'rcs_tenant_fk',
      columns: [table.tenantId],
      foreignColumns: [tenantsTable.id],
    }),

    rcsPlatformServiceFk: foreignKey({
      name: 'rcs_ps_fk',
      columns: [table.platformServiceId],
      foreignColumns: [platformServiceTable.id],
    }),

    rcsPlatformServiceFeatureFk: foreignKey({
      name: 'rcs_psf_fk',
      columns: [table.platformServiceFeatureId],
      foreignColumns: [platformServiceFeatureTable.id],
    }),

    rcsRoleFk: foreignKey({
      name: 'rcs_role_fk',
      columns: [table.roleId],
      foreignColumns: [roleTable.id],
    }),

    uniqRoleCommissionRule: uniqueIndex('uniq_role_commission_rule').on(
      table.tenantId,
      table.roleId,
      table.platformServiceFeatureId,
    ),

    idxRcsTenant: index('idx_rcs_tenant').on(table.tenantId),

    idxRcsRole: index('idx_rcs_role').on(table.roleId),

    idxRcsFeature: index('idx_rcs_feature').on(table.platformServiceFeatureId),
  }),
);
