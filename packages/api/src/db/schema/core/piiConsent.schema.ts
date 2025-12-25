import {
  pgTable,
  uuid,
  timestamp,
  foreignKey,
  varchar,
  boolean,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { tenantsTable, usersTable } from './index';

export const consentSource = pgEnum('consent_source', ['WEB', 'MOBILE']);

export const piiConsentTable = pgTable(
  'pii_consent',
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid().notNull(),
    tenantId: uuid().notNull(),
    purpose: varchar('purpose', { length: 255 }).notNull(),
    consentGiven: boolean('consent_given').notNull(),
    consentSource: consentSource('consent_source').notNull(),
    consentVersion: varchar('consent_version', { length: 50 }).notNull(),
    consenAt: timestamp('consent_at').notNull(),
    expireAt: timestamp('expire_at'),
    consenRevokedAt: timestamp('consent_revoked_at'),
    consenRevokedReason: varchar('consent_revoked_reason', { length: 500 }),
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
