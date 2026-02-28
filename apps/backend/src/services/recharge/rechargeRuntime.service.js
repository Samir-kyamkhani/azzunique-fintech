import { db } from '../../database/core/core-db.js';
import { eq, and } from 'drizzle-orm';

import {
  platformServiceFeatureTable,
  platformServiceProviderTable,
  platformServiceTable,
  serviceProviderFeatureTable,
  serviceProviderTable,
} from '../../models/core/index.js';

import { ApiError } from '../../lib/ApiError.js';
import tenantServiceEffective from '../../lib/tenantService.effective.js';

class RechargeRuntimeService {
  /* RESOLVE SERVICE + PROVIDER (INITIATE FLOW)           */
  static async resolve({ tenantChain, platformServiceCode, featureCode }) {
    const currentTenantId = tenantChain?.[0];

    if (!currentTenantId) {
      throw ApiError.internal('Invalid tenant chain');
    }

    // 1️⃣ Fetch platform service
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
      throw ApiError.notFound('Recharge service not configured');
    }

    // 2️⃣ Effective hierarchy enable check
    const isEnabled = await tenantServiceEffective.isServiceEffectivelyEnabled(
      currentTenantId,
      service.id,
    );

    if (!isEnabled) {
      throw ApiError.forbidden('Recharge service disabled');
    }

    // 3️⃣ Resolve provider by FEATURE
    const [row] = await db
      .select({
        providerId: serviceProviderTable.id,
        providerCode: serviceProviderTable.code,
        config: platformServiceProviderTable.config,
        featureId: platformServiceFeatureTable.id,
      })
      .from(platformServiceProviderTable)

      .innerJoin(
        platformServiceTable,
        eq(
          platformServiceTable.id,
          platformServiceProviderTable.platformServiceId,
        ),
      )

      .innerJoin(
        serviceProviderTable,
        eq(
          serviceProviderTable.id,
          platformServiceProviderTable.serviceProviderId,
        ),
      )

      .innerJoin(
        serviceProviderFeatureTable,
        eq(
          serviceProviderFeatureTable.serviceProviderId,
          serviceProviderTable.id,
        ),
      )

      .innerJoin(
        platformServiceFeatureTable,
        eq(
          platformServiceFeatureTable.id,
          serviceProviderFeatureTable.platformServiceFeatureId,
        ),
      )
      .where(
        and(
          eq(platformServiceProviderTable.platformServiceId, service.id),

          // FEATURE MATCH
          eq(platformServiceFeatureTable.code, featureCode),

          // SERVICE ACTIVE
          eq(platformServiceTable.isActive, true),

          // PROVIDER ACTIVE
          eq(serviceProviderTable.isActive, true),

          // FEATURE ACTIVE
          eq(platformServiceFeatureTable.isActive, true),

          // SERVICE ↔ PROVIDER ACTIVE
          eq(platformServiceProviderTable.isActive, true),
        ),
      )
      .limit(1);

    if (!row) {
      throw ApiError.internal(
        `No active provider configured for feature ${featureCode}`,
      );
    }

    return {
      service,
      feature: {
        id: row.featureId,
        code: featureCode,
      },
      provider: {
        providerId: row.providerId,
        code: row.providerCode,
        config: row.config,
      },
    };
  }
}

export default RechargeRuntimeService;
