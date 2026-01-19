import { eq } from 'drizzle-orm';
import { db } from '../database/core/core-db.js';
import { ApiError } from '../lib/ApiError.js';
import { platformServiceTable } from '../models/core/index.js';

class PlatformServiceService {
  async create(data, actor) {
    if (actor.roleLevel !== 0) {
      throw ApiError.forbidden('Only AZZUNIQUE can create platform services');
    }

    const existingService = await db
      .select()
      .from(platformServiceTable)
      .where(eq(platformServiceTable.code, data.code))
      .limit(1);

    if (existingService.length) {
      throw ApiError.conflict(
        `Platform service with code '${data.code}' already exists`,
      );
    }

    await db.insert(platformServiceTable).values({
      code: data.code,
      name: data.name,
      isActive: data.isActive ?? true,
    });

    return this.list();
  }

  async list() {
    return db.select().from(platformServiceTable);
  }
}

export default new PlatformServiceService();
