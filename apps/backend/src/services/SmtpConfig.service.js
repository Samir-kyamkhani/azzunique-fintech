import { and, eq } from 'drizzle-orm';
import { smtpConfigTable } from '../models/core/smtpConfig.schema.js';
import { db } from '../database/core/core-db.js';
import { ApiError } from '../lib/ApiError.js';
import crypto from 'crypto';
import { decrypt, encrypt } from '../lib/lib.js';

class SmtpConfigService {
  // GET BY ID (many times)
  static async getById(id, actor) {
    const [config] = await db
      .select()
      .from(smtpConfigTable)
      .where(
        and(
          // eq(smtpConfigTable.id, id),
          eq(smtpConfigTable.tenantId, actor.tenantId),
        ),
      )
      .limit(1);

    if (!config) {
      throw ApiError.notFound('SMTP config not found');
    }

    const decryptedPassword = decrypt(config.smtpPassword);
    config.smtpPassword = decryptedPassword;

    return config;
  }

  // CREATE (only once per tenant)
  static async create(payload, actor) {
    const [existing] = await db
      .select()
      .from(smtpConfigTable)
      .where(eq(smtpConfigTable.tenantId, actor.tenantId))
      .limit(1);

    if (existing) {
      throw ApiError.conflict('SMTP config already exists for this tenant');
    }

    const passEncrypted = encrypt(payload.smtpPassword);

    const id = crypto.randomUUID();
    await db.insert(smtpConfigTable).values({
      id,
      ...payload,
      tenantId: actor.tenantId,
      smtpPassword: passEncrypted,
      encryptionType: payload.encryptionType.toUpperCase(),
      createdByUserId: actor.type === 'USER' ? actor.id : null,
      createdByEmployeeId: actor.type === 'EMPLOYEE' ? actor.id : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return this.getById(id, actor);
  }

  // UPDATE (many times)
  static async update(id, payload, actor) {
    const config = await this.getById(id, actor);

    const passEncrypted = encrypt(payload.smtpPassword);

    await db
      .update(smtpConfigTable)
      .set({ ...payload, smtpPassword: passEncrypted, updatedAt: new Date() })
      .where(eq(smtpConfigTable.id, id));

    return this.getById(id, actor);
  }
}

export { SmtpConfigService };
