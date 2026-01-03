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
  static async create(payload = {}, actor) {
    const id = crypto.randomUUID();

    await db.insert(serverDetailTable).values({
      id,
      ...payload,
      status: payload.status ? payload.status : 'ACTIVE',
      createdByUserId: actor.type === 'USER' ? actor.id : null,
      createdByEmployeeId: actor.type === 'EMPLOYEE' ? actor.id : null,
      createdAt: new Date(),
    });

    return this.getById(id);
  }

  // UPDATE
  static async update(id, payload = {}) {
    const server = await this.getById(id);

    await db
      .update(serverDetailTable)
      .set({
        ...payload,
        status: payload.status ? payload.status : 'ACTIVE',
        updatedAt: new Date(),
      })
      .where(eq(serverDetailTable.id, id));

    return this.getById(id);
  }
}

export { ServerDetailService };
