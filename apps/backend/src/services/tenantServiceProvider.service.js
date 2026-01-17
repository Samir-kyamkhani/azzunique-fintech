import { db } from '../../database/core/core-db.js';
import { tenantServiceProviderTable } from '../../models/core/index.js';
import { ApiError } from '../../lib/ApiError.js';

class TenantServiceProvider {
  async assign(tenantId, data, actor) {
    if (!actor.isTenantOwner || actor.tenantId !== tenantId) {
      throw ApiError.forbidden('Only tenant owner allowed');
    }

    await db.insert(tenantServiceProviderTable).values({
      tenantId,
      platformServiceId: data.platformServiceId,
      serviceProviderId: data.serviceProviderId,
      config: data.config,
      isActive: true,
    });

    return { success: true };
  }
}

export default new TenantServiceProvider();
