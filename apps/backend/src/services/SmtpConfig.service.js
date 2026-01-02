import { eq } from 'drizzle-orm';
import { smtpConfigTable } from '../models/core/smtpConfig.schema.js';
import { db } from '../database/core/core-db.js';
import { ApiError } from '../lib/ApiError.js';
import crypto from 'crypto';

class SmtpConfigService {
  // GET BY ID (many times)
  static async getById(id) {
    const [config] = await db
      .select()
      .from(smtpConfigTable)
      .where(eq(smtpConfigTable.id, id))
      .limit(1);

    if (!config) {
      throw ApiError.notFound('SMTP config not found');
    }

    return config;
  }

  // CREATE (only once per tenant)
  static async create(payload) {
    // check if SMTP config exists for tenant
    const [existing] = await db
      .select()
      .from(smtpConfigTable)
      .where(eq(smtpConfigTable.tenantId, payload.tenantId))
      .limit(1);

    if (existing) {
      throw ApiError.conflict('SMTP config already exists for this tenant');
    }

    const id = crypto.randomUUID();
    await db.insert(smtpConfigTable).values({
      id,
      ...payload,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return this.getById(id);
  }

  // UPDATE (many times)
  static async update(id, payload) {
    const config = await this.getById(id);

    await db
      .update(smtpConfigTable)
      .set({ ...payload, updatedAt: new Date() })
      .where(eq(smtpConfigTable.id, id));

    return this.getById(id);
  }
}

export { SmtpConfigService };
