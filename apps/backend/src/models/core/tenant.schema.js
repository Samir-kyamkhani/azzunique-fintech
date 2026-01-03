import {
  mysqlTable,
  varchar,
  timestamp,
  foreignKey,
  uniqueIndex,
  index,
} from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

export const tenantsTable = mysqlTable(
  'tenants',
  {
    id: varchar('id', { length: 36 })
      .primaryKey()
      .default(sql`(UUID())`),

    tenantNumber: varchar('tenant_number', { length: 30 }).notNull(),

    tenantName: varchar('tenant_name', { length: 255 }).notNull(),
    tenantLegalName: varchar('tenant_legal_name', {
      length: 255,
    }).notNull(),

    tenantType: varchar('tenant_type', { length: 30 }).notNull(),
    // PROPRIETORSHIP | PARTNERSHIP | PRIVATE_LIMITED

    userType: varchar('user_type', { length: 20 }).notNull(),
    // AZZUNIQUE | RESELLER | WHITELABEL

    tenantEmail: varchar('tenant_email', {
      length: 255,
    }).notNull(),

    tenantWhatsapp: varchar('tenant_whatsapp', {
      length: 20,
    }).notNull(),

    parentTenantId: varchar('parent_tenant_id', {
      length: 36,
    }),

    createdByEmployeeId: varchar('created_by_employee_id', {
      length: 36,
    }),

    tenantStatus: varchar('tenant_status', { length: 20 }).notNull(),
    // ACTIVE | INACTIVE | SUSPENDED

    tenantMobileNumber: varchar('tenant_mobile_number', {
      length: 20,
    }).notNull(),

    actionReason: varchar('action_reason', { length: 255 }),
    actionedAt: timestamp('actioned_at'),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },

  (table) => ({
    tenantParentFk: foreignKey({
      name: 'tenant_parent_fk',
      columns: [table.parentTenantId],
      foreignColumns: [table.id],
    }),

    uniqTenantNumber: uniqueIndex('uniq_tenant_number').on(table.tenantNumber),

    uniqTenantEmail: uniqueIndex('uniq_tenant_email').on(table.tenantEmail),

    idxTenantParent: index('idx_tenant_parent').on(table.parentTenantId),

    idxTenantStatus: index('idx_tenant_status').on(table.tenantStatus),
  }),
);
