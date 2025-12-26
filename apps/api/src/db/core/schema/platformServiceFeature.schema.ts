import {
  mysqlTable,
  varchar,
  timestamp,
  boolean,
  foreignKey,
  uniqueIndex,
  index,
} from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

import { platformServiceTable } from './index';

export const platformServiceFeatureTable = mysqlTable(
  'platform_service_features',
  {
    id: varchar('id', { length: 36 })
  .primaryKey()
  .default(sql`(UUID())`),

    code: varchar('code', { length: 40 }).notNull(),

    name: varchar('name', { length: 100 }).notNull(),

    isActive: boolean('is_active').default(true).notNull(),

    platformServiceId: varchar('platform_service_id', {
      length: 36,
    }).notNull(),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },

  (table) => ({
    psfPlatformServiceFk: foreignKey({
      name: 'psf_ps_fk',
      columns: [table.platformServiceId],
      foreignColumns: [platformServiceTable.id],
    }),

    uniqPlatformServiceFeature: uniqueIndex('uniq_platform_service_feature').on(
      table.platformServiceId,
      table.code,
    ),

    idxPsfService: index('idx_psf_service').on(table.platformServiceId),

    idxPsfActive: index('idx_psf_active').on(table.isActive),
  }),
);
