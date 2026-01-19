import { eq, and } from 'drizzle-orm';
import { db } from '../database/core/core-db.js';
import { ApiError } from '../lib/ApiError.js';
import {
  serviceProviderTable,
  platformServiceTable,
} from '../models/core/index.js';

class ServiceProviderService {
  async create(data, actor) {
    if (actor.roleLevel !== 0) {
      throw ApiError.forbidden('Only AZZUNIQUE can create providers');
    }

    const service = await db
      .select()
      .from(platformServiceTable)
      .where(eq(platformServiceTable.id, data.platformServiceId))
      .limit(1);

    if (!service.length) {
      throw ApiError.badRequest('Platform service does not exist');
    }

    const existingProvider = await db
      .select()
      .from(serviceProviderTable)
      .where(
        and(
          eq(serviceProviderTable.platformServiceId, data.platformServiceId),
          eq(serviceProviderTable.code, data.code),
        ),
      )
      .limit(1);

    if (existingProvider.length) {
      throw ApiError.conflict(
        `Provider with code '${data.code}' already exists for this service`,
      );
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
