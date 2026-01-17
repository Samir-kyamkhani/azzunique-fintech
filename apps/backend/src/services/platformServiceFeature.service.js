import { db } from '../../database/core/core-db.js';
import { platformServiceFeatureTable } from '../../models/core/index.js';
import { ApiError } from '../../lib/ApiError.js';

class PlatformServiceFeatureService {
  async create(data, actor) {
    if (actor.roleLevel !== 0) {
      throw ApiError.forbidden('Only AZZUNIQUE can create service features');
    }

    await db.insert(platformServiceFeatureTable).values({
      platformServiceId: data.platformServiceId,
      code: data.code,
      name: data.name,
      isActive: data.isActive ?? true,
    });

    return { success: true };
  }
}

export default new PlatformServiceFeatureService();
