import { eq, and } from 'drizzle-orm';
import { db } from '../database/core/core-db.js';
import { ApiError } from '../lib/ApiError.js';
import {
  serviceProviderTable,
  platformServiceTable,
} from '../models/core/index.js';

class ServiceProviderService {
  assertAzzunique(actor) {
    if (actor.roleLevel !== 0) {
      throw ApiError.forbidden('Only AZZUNIQUE allowed');
    }
  }

  async create(data, actor) {
    this.assertAzzunique(actor);

    const service = await db
      .select()
      .from(platformServiceTable)
      .where(eq(platformServiceTable.id, data.platformServiceId))
      .limit(1);

    if (!service.length) {
      throw ApiError.badRequest('Platform service does not exist');
    }

    const existing = await db
      .select()
      .from(serviceProviderTable)
      .where(
        and(
          eq(serviceProviderTable.platformServiceId, data.platformServiceId),
          eq(serviceProviderTable.code, data.code),
        ),
      )
      .limit(1);

    if (existing.length) {
      throw ApiError.conflict('Service provider already exists');
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

  async listAll() {
    return db.select().from(serviceProviderTable);
  }

  async listByService(platformServiceId) {
    return db
      .select()
      .from(serviceProviderTable)
      .where(eq(serviceProviderTable.platformServiceId, platformServiceId));
  }

  async update(id, data, actor) {
    this.assertAzzunique(actor);

    await db
      .update(serviceProviderTable)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(serviceProviderTable.id, id));

    return { success: true };
  }

  async delete(id, actor) {
    this.assertAzzunique(actor);

    // soft delete
    await db
      .update(serviceProviderTable)
      .set({ isActive: false })
      .where(eq(serviceProviderTable.id, id));

    return { success: true };
  }
}

export default new ServiceProviderService();
