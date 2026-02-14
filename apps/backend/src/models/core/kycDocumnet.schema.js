import {
  mysqlTable,
  varchar,
  timestamp,
  json,
  index,
} from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

export const kycDocumentTable = mysqlTable(
  'kyc_documents',
  {
    id: varchar('id', { length: 36 })
      .primaryKey()
      .default(sql`(UUID())`),

    ownerType: varchar('owner_type', { length: 10 }).notNull(), // USER | TENANT
    ownerId: varchar('owner_id', { length: 36 }).notNull(),

    documentType: varchar('document_type', { length: 50 }).notNull(), // PAN | AADHAAR | GST

    documentUrl: varchar('document_url', { length: 500 }).notNull(),
    documentNumber: varchar('document_number', { length: 255 }),

    rowResponse: json('row_response'),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    idxOwner: index('idx_owner').on(table.ownerType, table.ownerId),
    idxDocType: index('idx_doc_type').on(table.documentType),
  }),
);
