import { eq, and } from 'drizzle-orm';

import {
  tenantServiceTable,
  platformServiceProviderTable,
  platformServiceTable,
  serviceProviderTable,
} from '../models/core/index.js';
import { db } from '../database/core/core-db.js';
import { ApiError } from './ApiError.js';
import tenantServiceEffective from './tenantService.effective.js';

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

  console.log('service', service);

  const enabled = await tenantServiceEffective.isServiceEffectivelyEnabled(
    tenantChain[0],
    service.id,
  );
  console.log('enabled', enabled);
  

  if (!enabled) {
    throw ApiError.forbidden(
      `${platformServiceCode} service disabled for in this tenant hierachy`,
    );
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

    console.log("row", row);
    
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
