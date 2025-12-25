import {
  pgTable,
  uuid,
  timestamp,
  foreignKey,
  pgEnum,
  integer,
  boolean,
} from 'drizzle-orm/pg-core';
import {
  platformServiceFeatureTable,
  platformServiceTable,
  roleTable,
  tenantsTable,
} from './index';

export const roleCommissionType = pgEnum('role_commission_type', ['FLAT', 'PERCENTAGE']);
export const roleGstOnType = pgEnum('role_gst_on_type', [
  'COMMISSION',
  'SURCHARGE',
  'BOTH',
]);

export const roleCommissionSettingTable = pgTable(
  'role_commission_settings',
  {
    id: uuid().primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull(),
    platformServiceId: uuid('platform_service_id').notNull(),
    platformServiceFeatureId: uuid('platform_service_feature_id').notNull(),
    roleId: uuid('role_id').notNull(),
    commissionType: roleCommissionType().notNull(),
    commissionValue: integer('commission_value').notNull(),
    surchargeType: roleCommissionType().notNull(),
    surchargeValue: integer('surcharge_value').notNull(),
    gstApplicable: boolean('gst_applicable').default(false).notNull(),
    gstRate: integer('gst_rate').default(18).notNull(),
    gstOn: roleGstOnType().notNull(),
    gstInclusive: boolean('gst_inclusive').default(false).notNull(),
    maxCommissionValue: integer('max_commission_value').default(0).notNull(),
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

    roleFk: foreignKey({
      columns: [table.roleId],
      foreignColumns: [roleTable.id],
    }),
  }),
);
