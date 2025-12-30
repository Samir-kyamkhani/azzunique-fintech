import {
  mysqlTable,
  varchar,
  timestamp,
  foreignKey,
  uniqueIndex,
} from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

import { tenantsTable, usersTable } from './index';

export const departmentTable = mysqlTable(
  'departments',
  {
    id: varchar('id', { length: 36 })
      .primaryKey()
      .default(sql`(UUID())`),

    departmentCode: varchar('department_code', { length: 50 }).notNull(),

    departmentName: varchar('department_name', { length: 100 }).notNull(),
    departmentDescription: varchar('department_description', {
      length: 255,
    }),

    tenantId: varchar('tenant_id', { length: 36 }).notNull(),

    createdByUserId: varchar('created_by_user_id', { length: 36 }),
    createdByEmployeeId: varchar('created_by_employee_id', { length: 36 }),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },

  (table) => ({
    // UNIQUE (departmentCode + tenantId)
    uniqDeptCodeTenant: uniqueIndex('uniq_dept_code_tenant').on(
      table.departmentCode,
      table.tenantId,
    ),

    departmentCreatedByUserFk: foreignKey({
      name: 'dept_created_by_user_fk',
      columns: [table.createdByUserId],
      foreignColumns: [usersTable.id],
    }),

    departmentCreatedByEmployeeFk: foreignKey({
      name: 'dept_created_by_employee_fk',
      columns: [table.createdByEmployeeId],
      foreignColumns: [usersTable.id],
    }),
    tenantIdFk: foreignKey({
      name: 'dept_tenant_fk',
      columns: [table.tenantId],
      foreignColumns: [tenantsTable.id],
    }),
  }),
);
