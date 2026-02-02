import { db } from '../../database/core/core-db.js';
import {
  tenantServiceTable,
  platformServiceProviderTable,
  platformServiceTable,
} from '../../models/core/index.js';
import { ApiError } from '../../lib/ApiError.js';

// RULE: User → WL → Reseller → AZZUNIQUE (sab ke liye service enabled honi chahiye)
class RechargeRuntimeService {
  static async resolve({ tenantChain, platformServiceCode }) {
    // 1️⃣ Find platform service
    const [service] = await db
      .select()
      .from(platformServiceTable)
      .where(eq(platformServiceTable.code, platformServiceCode))
      .limit(1);

    if (!service) {
      throw ApiError.notFound('Recharge service not configured');
    }

    // 2️⃣ Hierarchy enable check (BOTTOM → TOP)
    for (const tenantId of tenantChain) {
      const [enabled] = await db
        .select()
        .from(tenantServiceTable)
        .where(
          and(
            eq(platformServiceProviderTable.tenantId, tenantId),
            eq(platformServiceProviderTable.platformServiceId, service.id),
            eq(platformServiceProviderTable.isActive, true),
          ),
        )
        .limit(1);

      if (!enabled) {
        throw ApiError.forbidden(
          'Recharge service disabled for this hierarchy',
        );
      }
    }

    // 3️⃣ Final provider resolution (TOP MOST CONFIG WINS)
    for (const tenantId of tenantChain) {
      const [provider] = await db
        .select()
        .from(platformServiceProviderTable)
        .where(
          and(
            eq(platformServiceProviderTable.tenantId, tenantId),
            eq(platformServiceProviderTable.platformServiceId, service.id),
            eq(platformServiceProviderTable.isActive, true),
          ),
        )
        .limit(1);

      if (provider) {
        return {
          service,
          provider,
        };
      }
    }

    throw ApiError.internal('Recharge provider not configured');
  }
}

export default RechargeRuntimeService;
