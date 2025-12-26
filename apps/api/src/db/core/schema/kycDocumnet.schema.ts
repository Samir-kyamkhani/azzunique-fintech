import {
  mysqlTable,
  varchar,
  timestamp,
  foreignKey,
  text,
} from 'drizzle-orm/mysql-core';
import { usersTable } from './index';

export const kycDocumentTable = mysqlTable(
  'kyc_documents',
  {
    id: varchar('id', { length: 36 }).primaryKey().default('UUID()'),

    // Enum-like fields
    ownerType: text('owner_type', { enum: ['TENANT', 'USER'] }).notNull(),
    ownerId: varchar('owner_id', { length: 36 }).notNull(), // userid or tenant id
    documentType: varchar('document_type', { length: 255 }).notNull(),
    documentSide: text('document_side', { enum: ['FRONT', 'BACK', 'SINGLE'] })
      .notNull()
      .default('SINGLE'),

    documentUrl: varchar('document_url', { length: 500 }).notNull(),
    documentNumber: varchar('document_number', { length: 255 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    ownerIdFk: foreignKey({
      columns: [table.ownerId],
      foreignColumns: [usersTable.id],
    }),
  }),
);
