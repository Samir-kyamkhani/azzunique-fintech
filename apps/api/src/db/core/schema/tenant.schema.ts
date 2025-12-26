import { sql } from 'drizzle-orm';
import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  timestamp,
  foreignKey,
  pgSequence,
} from 'drizzle-orm/pg-core';

export const tenantTypeEnum = pgEnum('tenant_type', [
  'PROPRIETORSHIP',
  'PARTNERSHIP',
  'PRIVATE_LIMITED',
]);

export const userTypeEnum = pgEnum('user_type', [
  'AZZUNIQUE',
  'RESELLER',
  'WHITELABEL',
]);

export const tenantStatus = pgEnum('tenant_status', [
  'ACTIVE',
  'INACTIVE',
  'SUSPENDED',
  'DELETED',
]);

export const tenantNumberSeq = pgSequence('tenant_number_seq');


export const tenantsTable = pgTable(
  'tenants',
  {
    id: uuid().primaryKey().defaultRandom(),
    tenantNumber: varchar('tenant_number', { length: 30 })
    .unique()
    .default(sql`'TEN-' || nextval('tenant_number_seq')`)
    .notNull(),
    tenantName: varchar('tenant_name', { length: 255 }).notNull(),
    tenantLegalName: varchar('tenant_legal_name', { length: 255 }).notNull(),
    tenantType: tenantTypeEnum().notNull(),
    userType: userTypeEnum().notNull(),
    tenantEmail: varchar('tenant_email', { length: 255 }).notNull().unique(),
    tenantWhatsapp: varchar('tenant_whatsapp', { length: 20 })
      .notNull()
      .unique(),
    parentTenantId: uuid('parent_tenant_id'),
    createdByEmployeeId: uuid('created_by_employee_id'),
    tenantStatus: tenantStatus().notNull(),
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
