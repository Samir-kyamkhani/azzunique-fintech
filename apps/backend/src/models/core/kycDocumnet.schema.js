import {
  mysqlTable,
  varchar,
  timestamp,
  foreignKey,
  index,
} from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

import { usersTable } from './index.js';

export const kycDocumentTable = mysqlTable(
  'kyc_documents',
  {
    id: varchar('id', { length: 36 })
      .primaryKey()
      .default(sql`(UUID())`),

    ownerType: varchar('owner_type', { length: 10 }).notNull(), // TENANT | USER

    ownerId: varchar('owner_id', { length: 36 }).notNull(),

    documentType: varchar('document_type', { length: 255 }).notNull(),

    documentSide: varchar('document_side', { length: 10 })
      .notNull()
      .default('SINGLE'), // FRONT | BACK | SINGLE

    documentUrl: varchar('document_url', { length: 500 }).notNull(),
    documentNumber: varchar('document_number', { length: 255 }),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },

  (table) => ({
    kycOwnerUserFk: foreignKey({
      name: 'kyc_owner_user_fk',
      columns: [table.ownerId],
      foreignColumns: [usersTable.id],
    }),

    idxKycOwner: index('idx_kyc_owner').on(table.ownerType, table.ownerId),

    idxKycDocType: index('idx_kyc_document_type').on(table.documentType),
  }),
);
