import { eq, and } from 'drizzle-orm';
import { db } from '../database/core/core-db.js';
import { ApiError } from '../lib/ApiError.js';
import {
  platformServiceTable,
  platformServiceFeatureTable,
} from '../models/core/index.js';

class PlatformServiceFeatureService {
  assertAdmin(actor) {
    if (actor.roleLevel !== 0) {
      throw ApiError.forbidden('Only admin allowed');
    }
  }

  async create(data, actor) {
    this.assertAdmin(actor);

    const service = await db
      .select()
      .from(platformServiceTable)
      .where(eq(platformServiceTable.id, data.platformServiceId))
      .limit(1);

    if (!service.length) {
      throw ApiError.badRequest('Service not found');
    }

    const existing = await db
      .select()
      .from(platformServiceFeatureTable)
      .where(
        and(
          eq(
            platformServiceFeatureTable.platformServiceId,
            data.platformServiceId,
          ),
          eq(platformServiceFeatureTable.code, data.code),
        ),
      )
      .limit(1);

    if (existing.length) {
      throw ApiError.conflict('Feature already exists');
    }

    await db.insert(platformServiceFeatureTable).values({
      ...data,
      isActive: data.isActive ?? true,
    });

    return { success: true };
  }

  async listByService(serviceId) {
    return db
      .select()
      .from(platformServiceFeatureTable)
      .where(eq(platformServiceFeatureTable.platformServiceId, serviceId));
  }

  async update(id, data, actor) {
    this.assertAdmin(actor);

    await db
      .update(platformServiceFeatureTable)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(platformServiceFeatureTable.id, id));

    return { success: true };
  }

  async delete(id, actor) {
    this.assertAdmin(actor);

    await db
      .update(platformServiceFeatureTable)
      .set({ isActive: false })
      .where(eq(platformServiceFeatureTable.id, id));

    return { success: true };
  }
}

export default new PlatformServiceFeatureService();
