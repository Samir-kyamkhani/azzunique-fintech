import { db } from '../../database/core/core-db.js';
import { platformServiceTable } from '../../models/core/index.js';
import { ApiError } from '../../lib/ApiError.js';

class PlatformServiceService {
  async create(data, actor) {
    if (actor.roleLevel !== 0) {
      throw ApiError.forbidden('Only AZZUNIQUE can create platform services');
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
