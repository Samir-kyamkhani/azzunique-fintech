import { mysqlTable, varchar, uniqueIndex } from 'drizzle-orm/mysql-core';

export const roleHierarchyTable = mysqlTable(
  'role_hierarchy',
  {
    parentRoleId: varchar('parent_role_id', { length: 36 }).notNull(),
    childRoleId: varchar('child_role_id', { length: 36 }).notNull(),
    tenantId: varchar('tenant_id', { length: 36 }).notNull(),
  },
  (t) => ({
    uniqHierarchy: uniqueIndex('uniq_role_hierarchy').on(
      t.parentRoleId,
      t.childRoleId,
      t.tenantId,
    ),
  }),
);
