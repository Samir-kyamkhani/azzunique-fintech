import { eq, and } from 'drizzle-orm';
import { db } from '../database/core/core-db.js';
import { ApiError } from '../lib/ApiError.js';
import {
  platformServiceFeatureTable,
  platformServiceTable,
} from '../models/core/index.js';

class PlatformServiceFeatureService {
  async create(data, actor) {
    if (actor.roleLevel !== 0) {
      throw ApiError.forbidden('Only AZZUNIQUE can create service features');
    }

    const service = await db
      .select()
      .from(platformServiceTable)
      .where(eq(platformServiceTable.id, data.platformServiceId))
      .limit(1);

    if (!service.length) {
      throw ApiError.badRequest('Platform service does not exist');
    }

    const existingFeature = await db
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

    if (existingFeature.length) {
      throw ApiError.conflict(
        `Feature with code '${data.code}' already exists for this service`,
      );
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
