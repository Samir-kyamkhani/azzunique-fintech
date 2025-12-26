import {
  pgTable,
  uuid,
  timestamp,
  foreignKey,
  pgEnum,
  integer,
} from 'drizzle-orm/pg-core';
import { tenantsTable } from './index';

export const walletOwnerType = pgEnum('wallet_owner_type', ['USER', 'TENANT']);

export const walletType = pgEnum('wallet_type', [
  'PRIMARY',
  'COMMISSION',
  'SURCHARGE',
  'GST',
  'HOLDING',
]);
export const walletStatus = pgEnum('wallet_status', [
  'ACTIVE',
  'BLOCKED',
  'SUSPENDED',
]);

export const walletTable = pgTable(
  'wallets',
  {
    id: uuid().primaryKey().defaultRandom(),
    tenantId: uuid().notNull(),
    ownerType: walletOwnerType().notNull(),
    ownerId: uuid().notNull(),
    walletType: walletType('wallet_type').notNull(),
    balance: integer('balance').notNull().default(0), // paise
    status: walletStatus('status').default('ACTIVE').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },

  (table) => ({
    tenantFk: foreignKey({
      columns: [table.tenantId],
      foreignColumns: [tenantsTable.id],
    }),
  }),
);
