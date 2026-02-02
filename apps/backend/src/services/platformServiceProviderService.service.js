import { eq } from 'drizzle-orm';
import { db } from '../database/core/core-db.js';
import { ApiError } from '../lib/ApiError.js';
import {
  platformServiceProviderTable,
  platformServiceTable,
  serviceProviderTable,
} from '../models/core/index.js';

class PlatformServiceProviderService {
  assertAzzunique(actor) {
    if (actor.roleLevel !== 0) {
      throw ApiError.forbidden('Only AZZUNIQUE allowed');
    }
  }

  async assign(data, actor) {
    this.assertAzzunique(actor);

    // 🔒 platform service must exist
    const service = await db
      .select()
      .from(platformServiceTable)
      .where(eq(platformServiceTable.id, data.platformServiceId))
      .limit(1);

    if (!service.length) {
      throw ApiError.badRequest('Platform service does not exist');
    }

    // 🔒 provider must exist
    const provider = await db
      .select()
      .from(serviceProviderTable)
      .where(eq(serviceProviderTable.id, data.serviceProviderId))
      .limit(1);

    if (!provider.length) {
      throw ApiError.badRequest('Service provider does not exist');
    }

    // UPSERT (1 provider per service)
    await db
      .insert(platformServiceProviderTable)
      .values({
        platformServiceId: data.platformServiceId,
        serviceProviderId: data.serviceProviderId,
        config: data.config,
        isActive: true,
      })
      .onDuplicateKeyUpdate({
        set: {
          serviceProviderId: data.serviceProviderId,
          config: data.config,
          isActive: true,
          updatedAt: new Date(),
        },
      });

    return { success: true };
  }

  async disable(platformServiceId, actor) {
    this.assertAzzunique(actor);

    const result = await db
      .update(platformServiceProviderTable)
      .set({ isActive: false })
      .where(
        eq(platformServiceProviderTable.platformServiceId, platformServiceId),
      );

    if (!result.rowsAffected) {
      throw ApiError.notFound('No provider assigned for this service');
    }

    return { success: true };
  }
}

export default new PlatformServiceProviderService();
