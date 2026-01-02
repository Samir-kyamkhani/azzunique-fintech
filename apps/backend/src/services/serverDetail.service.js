import { eq } from 'drizzle-orm';
import { serverDetailTable } from '../models/core/serverDetails.schema.js';
import { db } from '../database/core/core-db.js';
import { ApiError } from '../lib/ApiError.js';
import crypto from 'node:crypto';

class ServerDetailService {
  // GET BY ID
  static async getById(id) {
    const [server] = await db
      .select()
      .from(serverDetailTable)
      .where(eq(serverDetailTable.id, id))
      .limit(1);

    if (!server) {
      throw ApiError.notFound('Server detail not found');
    }

    return server;
  }

  // GET ALL ACTIVE
  static async getAll() {
    return db
      .select()
      .from(serverDetailTable)
      .where(eq(serverDetailTable.status));
  }

  // CREATE
  static async create(payload) {
    const id = crypto.randomUUID();

    await db.insert(serverDetailTable).values({
      id,
      ...payload,
      status: 'ACTIVE',
      createdAt: new Date(),
    });

    return this.getById(id);
  }

  // UPDATE
  static async update(id, payload) {
    const server = await this.getById(id);

    await db
      .update(serverDetailTable)
      .set({ ...payload, updatedAt: new Date() })
      .where(eq(serverDetailTable.id, id));

    return this.getById(id);
  }

  // STATUS CHANGE
  static async updateStatus(id, payload) {
    const server = await this.getById(id);

    await db
      .update(serverDetailTable)
      .set({
        status: payload.status,
        updatedAt: new Date(),
      })
      .where(eq(serverDetailTable.id, id));

    return this.getById(id);
  }

  // DELETE
  static async softDelete(id) {
    const server = await this.getById(id);

    await db.delete(serverDetailTable).where(eq(serverDetailTable.id, id));

    return true;
  }
}

export { ServerDetailService };
