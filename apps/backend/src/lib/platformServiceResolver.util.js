import { eq, and } from 'drizzle-orm';

import {
  tenantServiceTable,
  platformServiceProviderTable,
  platformServiceTable,
  serviceProviderTable,
} from '../models/core/index.js';
import { db } from '../database/core/core-db.js';
import { ApiError } from './ApiError.js';

export async function platformServiceResolve({
  tenantChain,
  platformServiceCode,
}) {
  // 1️⃣ Platform service
  const [service] = await db
    .select({
      id: platformServiceTable.id,
      code: platformServiceTable.code,
      name: platformServiceTable.name,
    })
    .from(platformServiceTable)
    .where(eq(platformServiceTable.code, platformServiceCode))
    .limit(1);

  if (!service) {
    throw ApiError.notFound(`${platformServiceCode} service not configured`);
  }

  // 2️⃣ Hierarchy enable check (BOTTOM → TOP)
  for (const tenantId of tenantChain) {
    const [enabled] = await db
      .select()
      .from(tenantServiceTable)
      .where(
        and(
          eq(tenantServiceTable.tenantId, tenantId),
          eq(tenantServiceTable.platformServiceId, service.id),
          eq(tenantServiceTable.isEnabled, true),
        ),
      )
      .limit(1);

    if (!enabled) {
      throw ApiError.forbidden(
        `${platformServiceCode} service disabled for this hierarchy`,
      );
    }
  }

  // 3️⃣ Provider resolve (TOP MOST ACTIVE)
  const [row] = await db
    .select({
      providerId: platformServiceProviderTable.id,
      providerCode: serviceProviderTable.code,
      config: platformServiceProviderTable.config,
    })
    .from(platformServiceProviderTable)
    .innerJoin(
      serviceProviderTable,
      eq(
        serviceProviderTable.id,
        platformServiceProviderTable.serviceProviderId,
      ),
    )
    .where(
      and(
        eq(platformServiceProviderTable.platformServiceId, service.id),
        eq(platformServiceProviderTable.isActive, true),
      ),
    )
    .limit(1);

  if (!row) {
    throw ApiError.internal(`${platformServiceCode} provider not configured`);
  }

  return {
    service,
    provider: {
      providerId: row.providerId,
      code: row.providerCode, // ✅ IMPORTANT
      config: row.config, // 🔐 snapshot this
    },
  };
}
