import {
  mysqlTable,
  varchar,
  timestamp,
  int,
  foreignKey,
  uniqueIndex,
  index,
} from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';
import { tenantsTable } from './index.js';

export const walletTable = mysqlTable(
  'wallets',
  {
    id: varchar('id', { length: 36 })
      .primaryKey()
      .default(sql`(UUID())`),

    tenantId: varchar('tenant_id', { length: 36 }).notNull(),

    ownerType: varchar('owner_type', { length: 10 }).notNull(), // USER | TENANT

    ownerId: varchar('owner_id', { length: 36 }).notNull(),

    walletType: varchar('wallet_type', { length: 20 }).notNull(), // PRIMARY | COMMISSION | ...

    balance: int('balance').notNull().default(0),

    status: varchar('status', { length: 20 }).notNull().default('ACTIVE'),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },

  (table) => ({
    tenantFk: foreignKey({
      columns: [table.tenantId],
      foreignColumns: [tenantsTable.id],
    }),

    /** 🔐 VALID unique constraint now */
    uniqWalletIdentity: uniqueIndex('uniq_wallet_identity').on(
      table.tenantId,
      table.ownerType,
      table.ownerId,
      table.walletType,
    ),

    idxWalletTenant: index('idx_wallet_tenant').on(table.tenantId),
  }),
);
