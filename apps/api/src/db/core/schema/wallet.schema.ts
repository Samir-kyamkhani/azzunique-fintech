import {
  mysqlTable,
  varchar,
  timestamp,
  foreignKey,
  text,
  int,
} from 'drizzle-orm/mysql-core';
import { tenantsTable } from './index';

export const walletTable = mysqlTable(
  'wallets',
  {
    id: varchar('id', { length: 36 }).primaryKey().default('UUID()'),

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
    tenantFk: foreignKey({
      columns: [table.tenantId],
      foreignColumns: [tenantsTable.id],
    }),
  }),
);
