import { db } from '../../database/core/core-db.js';
import { eq, and } from 'drizzle-orm';
import {
  tenantServiceTable,
  platformServiceProviderTable,
  platformServiceTable,
  serviceProviderTable,
} from '../../models/core/index.js';
import { ApiError } from '../../lib/ApiError.js';

// RULE: User → WL → Reseller → AZZUNIQUE (sab ke liye service enabled honi chahiye)

/*
 * RechargeRuntimeService.resolve() ka sirf ek kaam hai:
 * Runtime pe ye decide karna:
 * Recharge service allowed hai ya nahi (hierarchy ke har level pe)
 * Kaunsa provider use hoga (WL / Reseller / AZZUNIQUE)
 */

class RechargeRuntimeService {
  static async resolve({ tenantChain, platformServiceCode }) {
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
      throw ApiError.notFound('Recharge service not configured');
    }

    // 2️⃣ Hierarchy enable check
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
          'Recharge service disabled for this hierarchy',
        );
      }
    }

    // 3️⃣ Provider resolve WITH CODE
    const [row] = await db
      .select({
        providerId: platformServiceProviderTable.serviceProviderId,
        providerCode: serviceProviderTable.code, // ✅ IMPORTANT
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
      throw ApiError.internal('Recharge provider not configured');
    }

    return {
      service,
      provider: {
        providerId: row.providerId,
        code: row.providerCode, // ✅ IMPORTANT
        config: row.config,
      },
    };
  }
}

export default RechargeRuntimeService;
