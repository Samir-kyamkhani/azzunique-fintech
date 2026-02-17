import { eq } from 'drizzle-orm';
import { db } from '../database/core/core-db.js';
import { ApiError } from '../lib/ApiError.js';
import { platformServiceTable } from '../models/core/index.js';

class PlatformServiceService {
  assertAdmin(actor) {
    if (actor.roleLevel !== 0) {
      throw ApiError.forbidden('Only admin allowed');
    }
  }

  async create(data, actor) {
    this.assertAdmin(actor);

    const existing = await db
      .select()
      .from(platformServiceTable)
      .where(eq(platformServiceTable.code, data.code))
      .limit(1);

    if (existing.length) {
      throw ApiError.conflict('Service already exists');
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

  async getById(id) {
    const [service] = await db
      .select()
      .from(platformServiceTable)
      .where(eq(platformServiceTable.id, id));

    if (!service) {
      throw ApiError.notFound('Service not found');
    }

    return service;
  }

  async update(id, data, actor) {
    this.assertAdmin(actor);

    await this.getById(id);

    await db
      .update(platformServiceTable)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(platformServiceTable.id, id));

    return this.getById(id);
  }

  async delete(id, actor) {
    this.assertAdmin(actor);

    await this.getById(id);

    await db
      .update(platformServiceTable)
      .set({ isActive: false })
      .where(eq(platformServiceTable.id, id));

    return { success: true };
  }
}

export default new PlatformServiceService();
