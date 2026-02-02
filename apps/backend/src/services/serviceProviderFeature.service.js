import { eq, and } from 'drizzle-orm';
import { db } from '../database/core/core-db.js';
import { ApiError } from '../lib/ApiError.js';
import { serviceProviderFeatureTable } from '../models/core/index.js';

class ServiceProviderFeatureService {
  assertAzzunique(actor) {
    if (actor.roleLevel !== 0) {
      throw ApiError.forbidden('Only AZZUNIQUE allowed');
    }
  }

  async map(data, actor) {
    this.assertAzzunique(actor);

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
      throw ApiError.conflict('Feature already mapped to provider');
    }

    await db.insert(serviceProviderFeatureTable).values(data);

    return { success: true };
  }

  async listByProvider(serviceProviderId) {
    return db
      .select()
      .from(serviceProviderFeatureTable)
      .where(
        eq(serviceProviderFeatureTable.serviceProviderId, serviceProviderId),
      );
  }

  async unmap(id, actor) {
    this.assertAzzunique(actor);

    await db
      .delete(serviceProviderFeatureTable)
      .where(eq(serviceProviderFeatureTable.id, id));

    return { success: true };
  }
}

export default new ServiceProviderFeatureService();
