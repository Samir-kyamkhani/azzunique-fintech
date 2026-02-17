import { eq } from 'drizzle-orm';
import { db } from '../database/core/core-db.js';
import { ApiError } from '../lib/ApiError.js';
import { serviceProviderTable } from '../models/core/index.js';
import { randomUUID } from 'node:crypto';

class ServiceProviderService {
  assertAdmin(actor) {
    if (actor.roleLevel !== 0) {
      throw ApiError.forbidden('Only admin allowed');
    }
  }

  async create(data, actor) {
    this.assertAdmin(actor);

    const existing = await db
      .select()
      .from(serviceProviderTable)
      .where(eq(serviceProviderTable.code, data.code))
      .limit(1);

    if (existing.length) {
      throw ApiError.conflict('Provider already exists');
    }

    const id = randomUUID();

    await db.insert(serviceProviderTable).values({
      id,
      code: data.code,
      providerName: data.providerName,
      handler: data.handler,
      isActive: data.isActive ?? true,
    });

    return { id };
  }

  async list() {
    return db.select().from(serviceProviderTable);
  }

  async update(id, data, actor) {
    this.assertAdmin(actor);

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
    this.assertAdmin(actor);

    await db
      .update(serviceProviderTable)
      .set({ isActive: false })
      .where(eq(serviceProviderTable.id, id));

    return { success: true };
  }
}

export default new ServiceProviderService();
