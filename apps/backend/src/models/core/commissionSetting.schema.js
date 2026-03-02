import {
  mysqlTable,
  varchar,
  timestamp,
  boolean,
  foreignKey,
  uniqueIndex,
  index,
  decimal,
  bigint,
} from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

import {
  platformServiceFeatureTable,
  platformServiceTable,
  tenantsTable,
  roleTable,
  usersTable,
} from './index.js';

export const commissionSettingTable = mysqlTable(
  'commission_settings',
  {
    id: varchar('id', { length: 36 })
      .primaryKey()
      .default(sql`(UUID())`),

    tenantId: varchar('tenant_id', { length: 36 }).notNull(),

    scope: varchar('scope', { length: 20 }).notNull(), // ROLE | USER

    roleId: varchar('role_id', { length: 36 }),
    targetUserId: varchar('target_user_id', { length: 36 }),

    platformServiceId: varchar('platform_service_id', {
      length: 36,
    }).notNull(),

    platformServiceFeatureId: varchar('platform_service_feature_id', {
      length: 36,
    }).notNull(),

    mode: varchar('mode', { length: 20 }).notNull(), // COMMISSION | SURCHARGE
    type: varchar('type', { length: 20 }).notNull(), // FLAT | PERCENTAGE

    // Always store money in paise
    value: bigint('value', { mode: 'number' }).notNull(),

    // Slab support (NULL issue removed)
    minAmount: bigint('min_amount', { mode: 'number' }).notNull().default(0),

    maxAmount: bigint('max_amount', { mode: 'number' }).notNull().default(0),

    applyTDS: boolean('apply_tds').default(false).notNull(),
    tdsPercent: decimal('tds_percent', { precision: 5, scale: 2 }),

    applyGST: boolean('apply_gst').default(false).notNull(),
    gstPercent: decimal('gst_percent', { precision: 5, scale: 2 }),

    isActive: boolean('is_active').default(true).notNull(),
    effectiveTo: timestamp('effective_to'),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    /* ================= UNIQUE RULES ================= */

    uniqUserRule: uniqueIndex('cs_user_rule_uniq').on(
      table.tenantId,
      table.targetUserId,
      table.platformServiceFeatureId,
      table.mode,
      table.minAmount,
    ),

    uniqRoleRule: uniqueIndex('cs_role_rule_uniq').on(
      table.tenantId,
      table.roleId,
      table.platformServiceFeatureId,
      table.mode,
      table.minAmount,
    ),

    /* ================= FOREIGN KEYS ================= */

    tenantFk: foreignKey({
      name: 'cs_tenant_fk',
      columns: [table.tenantId],
      foreignColumns: [tenantsTable.id],
    }),

    serviceFk: foreignKey({
      name: 'cs_ps_fk',
      columns: [table.platformServiceId],
      foreignColumns: [platformServiceTable.id],
    }),

    serviceFeatureFk: foreignKey({
      name: 'cs_psf_fk',
      columns: [table.platformServiceFeatureId],
      foreignColumns: [platformServiceFeatureTable.id],
    }),

    roleFk: foreignKey({
      name: 'cs_role_fk',
      columns: [table.roleId],
      foreignColumns: [roleTable.id],
    }),

    userFk: foreignKey({
      name: 'cs_user_fk',
      columns: [table.targetUserId],
      foreignColumns: [usersTable.id],
    }),

    /* ================= PERFORMANCE INDEX ================= */

    idxResolve: index('cs_resolve_idx').on(
      table.tenantId,
      table.scope,
      table.roleId,
      table.targetUserId,
      table.platformServiceFeatureId,
      table.isActive,
    ),
  }),
);
