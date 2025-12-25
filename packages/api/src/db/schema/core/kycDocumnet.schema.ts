import {
  pgTable,
  uuid,
  timestamp,
  foreignKey,
  varchar,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { usersTable } from './index';

export const ownerType = pgEnum('owner_type', ['TENANT', 'USER']);
export const documentSide = pgEnum('document_side', [
  'FRONT',
  'BACK',
  'SINGLE',
]);

export const kycDocumentTable = pgTable(
  'kyc_documents',
  {
    id: uuid().primaryKey().defaultRandom(),
    ownerType: ownerType().notNull(),
    ownerId: uuid('owner_id').notNull(), // userid or tenant id based on ownerType
    documentType: varchar('document_type', { length: 255 }).notNull(),
    documentSide: documentSide().notNull(),
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
