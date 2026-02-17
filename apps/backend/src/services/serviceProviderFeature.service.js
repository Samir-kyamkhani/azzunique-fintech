import { eq, and } from 'drizzle-orm';
import { db } from '../database/core/core-db.js';
import { ApiError } from '../lib/ApiError.js';
import { serviceProviderFeatureTable } from '../models/core/index.js';

class ServiceProviderFeatureService {
  assertAdmin(actor) {
    if (actor.roleLevel !== 0) {
      throw ApiError.forbidden('Only admin allowed');
    }
  }

  async map(data, actor) {
    this.assertAdmin(actor);

    const existing = await db
      .select()
      .from(serviceProviderFeatureTable)
      .where(
        and(
          eq(
            serviceProviderFeatureTable.serviceProviderId,
            data.serviceProviderId,
          ),
          eq(
            serviceProviderFeatureTable.platformServiceFeatureId,
            data.platformServiceFeatureId,
          ),
        ),
      )
      .limit(1);

    if (existing.length) {
      throw ApiError.conflict('Feature already mapped');
    }

    await db.insert(serviceProviderFeatureTable).values(data);

    return { success: true };
  }

  async unmap(serviceProviderId, featureId, actor) {
    this.assertAdmin(actor);

    await db
      .delete(serviceProviderFeatureTable)
      .where(
        and(
          eq(serviceProviderFeatureTable.serviceProviderId, serviceProviderId),
          eq(serviceProviderFeatureTable.platformServiceFeatureId, featureId),
        ),
      );

    return { success: true };
  }
}

export default new ServiceProviderFeatureService();
