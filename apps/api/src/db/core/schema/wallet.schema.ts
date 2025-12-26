import {
  mysqlTable,
  varchar,
  timestamp,
  foreignKey,
  text,
  int,
  uniqueIndex,
  index,
} from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

import { tenantsTable } from './index';

export const walletTable = mysqlTable(
  'wallets',
  {
    id: varchar('id', { length: 36 })
  .primaryKey()
  .default(sql`(UUID())`),

    tenantId: varchar('tenant_id', { length: 36 }).notNull(),

    ownerType: text('owner_type', {
      enum: ['USER', 'TENANT'],
    }).notNull(),

    ownerId: varchar('owner_id', { length: 36 }).notNull(),

    walletType: text('wallet_type', {
      enum: ['PRIMARY', 'COMMISSION', 'SURCHARGE', 'GST', 'HOLDING'],
    }).notNull(),

    balance: int('balance').notNull().default(0), // paise

    status: text('status', {
      enum: ['ACTIVE', 'BLOCKED', 'SUSPENDED'],
    })
      .notNull()
      .default('ACTIVE'),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },

  (table) => ({
    walletTenantFk: foreignKey({
      name: 'wallet_tenant_fk',
      columns: [table.tenantId],
      foreignColumns: [tenantsTable.id],
    }),

    uniqWalletIdentity: uniqueIndex('uniq_wallet_identity').on(
      table.tenantId,
      table.ownerType,
      table.ownerId,
      table.walletType,
    ),

    idxWalletOwner: index('idx_wallet_owner').on(
      table.ownerType,
      table.ownerId,
    ),

    idxWalletTenantStatus: index('idx_wallet_tenant_status').on(
      table.tenantId,
      table.status,
    ),
  }),
);
