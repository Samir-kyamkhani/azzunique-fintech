import {
  mysqlTable,
  varchar,
  timestamp,
  foreignKey,
  index,
} from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

import { usersTable } from './index';

export const serverDetailTable = mysqlTable(
  'server_details',
  {
    id: varchar('id', { length: 36 })
      .primaryKey()
      .default(sql`(UUID())`),

    recordType: varchar('record_type', { length: 50 }).notNull(),

    hostname: varchar('hostname', { length: 255 }).notNull(),

    value: varchar('value', { length: 45 }).notNull(),

    status: varchar('status', { length: 20 }).notNull().default('ACTIVE'), // ACTIVE | INACTIVE

    createdByUserId: varchar('created_by_user_id', {
      length: 36,
    }).notNull(),

    createdByEmployeeId: varchar('created_by_employee_id', {
      length: 36,
    }),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },

  (table) => ({
    serverCreatedByUserFk: foreignKey({
      name: 'server_created_by_user_fk',
      columns: [table.createdByUserId],
      foreignColumns: [usersTable.id],
    }),

    idxServerHostnameStatus: index('idx_server_hostname_status').on(
      table.hostname,
      table.status,
    ),
  }),
);
