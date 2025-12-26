import {
  mysqlTable,
  varchar,
  timestamp,
  foreignKey,
  text,
} from 'drizzle-orm/mysql-core';

export const tenantsTable = mysqlTable(
  'tenants',
  {
    id: varchar('id', { length: 36 }).primaryKey().default('UUID()'),
    tenantNumber: varchar('tenant_number', { length: 30 }).unique().notNull(),
    tenantName: varchar('tenant_name', { length: 255 }).notNull(),
    tenantLegalName: varchar('tenant_legal_name', { length: 255 }).notNull(),

    tenantType: text('tenant_type', {
      enum: ['PROPRIETORSHIP', 'PARTNERSHIP', 'PRIVATE_LIMITED'],
    }).notNull(),

    userType: text('user_type', {
      enum: ['AZZUNIQUE', 'RESELLER', 'WHITELABEL'],
    }).notNull(),

    tenantEmail: varchar('tenant_email', { length: 255 }).notNull().unique(),
    tenantWhatsapp: varchar('tenant_whatsapp', { length: 20 })
      .notNull()
      .unique(),

    parentTenantId: varchar('parent_tenant_id', { length: 36 }),
    createdByEmployeeId: varchar('created_by_employee_id', { length: 36 }),

    tenantStatus: text('tenant_status', {
      enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'DELETED'],
    }).notNull(),

    tenantMobileNumber: varchar('tenant_mobile_number', {
      length: 20,
    }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },

  (table) => ({
    parentTenantFk: foreignKey({
      columns: [table.parentTenantId],
      foreignColumns: [table.id],
    }),
  }),
);
