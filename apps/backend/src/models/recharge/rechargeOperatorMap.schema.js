import { mysqlTable, timestamp, varchar, unique } from 'drizzle-orm/mysql-core';

export const rechargeOperatorMapTable = mysqlTable(
  'recharge_operator_map',
  {
    id: varchar('id', { length: 36 }).primaryKey(),

    platformServiceId: varchar('platform_service_id', { length: 36 }).notNull(),

    platformServiceFeatureId: varchar('platform_service_feature_id', {
      length: 36,
    }).notNull(),

    serviceProviderId: varchar('service_provider_id', { length: 36 }).notNull(),

    internalOperatorCode: varchar('internal_operator_code', {
      length: 20,
    }).notNull(),

    providerOperatorCode: varchar('provider_operator_code', {
      length: 20,
    }).notNull(),

    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    uniq: unique('uq_rom_int_ps_feat_prov').on(
      table.internalOperatorCode,
      table.platformServiceId,
      table.platformServiceFeatureId,
      table.serviceProviderId,
    ),
  }),
);
