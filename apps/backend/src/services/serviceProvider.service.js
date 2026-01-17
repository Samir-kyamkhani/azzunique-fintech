import { db } from '../../database/core/core-db.js';
import { serviceProviderTable } from '../../models/core/index.js';
import { ApiError } from '../../lib/ApiError.js';

class ServiceProviderService {
  async create(data, actor) {
    if (actor.roleLevel !== 0) {
      throw ApiError.forbidden('Only AZZUNIQUE can create providers');
    }

    await db.insert(serviceProviderTable).values({
      platformServiceId: data.platformServiceId,
      code: data.code,
      providerName: data.providerName,
      handler: data.handler,
      isActive: data.isActive ?? true,
    });

    return { success: true };
  }
}

export default new ServiceProviderService();
