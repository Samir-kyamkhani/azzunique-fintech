import { tenantServiceTable } from '../models/core/index.js';
import { ApiError } from '../lib/ApiError.js';
import { db } from '../database/core/core-db.js';

class TenantService {
  async enable(tenantId, data, actor) {
    if (!actor.isTenantOwner || actor.tenantId !== tenantId) {
      throw ApiError.forbidden('Only tenant owner can enable services');
    }

    await db.insert(tenantServiceTable).values({
      tenantId,
      platformServiceId: data.platformServiceId,
      isEnabled: data.isEnabled ?? true,
    });

    return { success: true };
  }
}

export default new TenantService();
