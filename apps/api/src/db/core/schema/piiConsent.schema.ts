import {
  mysqlTable,
  varchar,
  timestamp,
  foreignKey,
  boolean,
  text,
} from 'drizzle-orm/mysql-core';
import { tenantsTable, usersTable } from './index';

export const piiConsentTable = mysqlTable(
  'pii_consent',
  {
    id: varchar('id', { length: 36 }).primaryKey().default('UUID()'),
    userId: varchar('user_id', { length: 36 }).notNull(),
    tenantId: varchar('tenant_id', { length: 36 }).notNull(),
    purpose: varchar('purpose', { length: 255 }).notNull(),
    consentGiven: boolean('consent_given').notNull(),
    consentSource: text('consent_source', {
      enum: ['WEB', 'MOBILE'],
    }).notNull(),
    consentVersion: varchar('consent_version', { length: 50 }).notNull(),
    consentAt: timestamp('consent_at').notNull(),
    expireAt: timestamp('expire_at'),
    consentRevokedAt: timestamp('consent_revoked_at'),
    consentRevokedReason: varchar('consent_revoked_reason', { length: 500 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    userIdFk: foreignKey({
      columns: [table.userId],
      foreignColumns: [usersTable.id],
    }),
    tenantIdFk: foreignKey({
      columns: [table.tenantId],
      foreignColumns: [tenantsTable.id],
    }),
  }),
);
