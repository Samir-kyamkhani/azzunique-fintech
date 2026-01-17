import { db } from '../../database/core/core-db.js';
import { serviceProviderFeatureTable } from '../../models/core/index.js';
import { ApiError } from '../../lib/ApiError.js';

class ServiceProviderFeatureService {
  async map(data, actor) {
    if (actor.roleLevel !== 0) {
      throw ApiError.forbidden('Only AZZUNIQUE can map provider features');
    }

    await db.insert(serviceProviderFeatureTable).values(data);
    return { success: true };
  }
}

export default new ServiceProviderFeatureService();
