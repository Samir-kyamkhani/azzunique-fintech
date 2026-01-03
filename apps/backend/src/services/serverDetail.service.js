import { and, eq } from 'drizzle-orm';
import { serverDetailTable } from '../models/core/serverDetails.schema.js';
import { db } from '../database/core/core-db.js';
import { ApiError } from '../lib/ApiError.js';
import crypto from 'node:crypto';

class ServerDetailService {
  // GET BY ID
  static async getByTenantId(actor) {
    if (!actor?.tenantId) {
      throw ApiError.unauthorized('Invalid actor');
    }

    const [server] = await db
      .select()
      .from(serverDetailTable)
      .where(eq(serverDetailTable.tenantId, actor.tenantId))
      .limit(1);

    if (!server) {
      throw ApiError.notFound('Server detail not found');
    }

    return server;
  }

  // UPSERT SERVER DETAIL
  static async upsert(payload = {}, actor) {
    if (!actor?.tenantId) {
      throw ApiError.unauthorized('Invalid actor');
    }

    const normalizedHostname = payload.hostname.trim().toLowerCase();

    // Check if record already exists for this tenant
    const [existingRecord] = await db
      .select()
      .from(serverDetailTable)
      .where(
        and(
          eq(serverDetailTable.tenantId, actor.tenantId),
          eq(serverDetailTable.recordType, payload.recordType),
          eq(serverDetailTable.hostname, normalizedHostname),
        ),
      )
      .limit(1);

    if (existingRecord) {
      // UPDATE existing record
      await db
        .update(serverDetailTable)
        .set({
          value: payload.value,
          status: payload.status ?? existingRecord.status,
          updatedAt: new Date(),
        })
        .where(eq(serverDetailTable.id, existingRecord.id));

      return {
        ...existingRecord,
        value: payload.value,
        status: payload.status ?? existingRecord.status,
        updatedAt: new Date(),
      };
    }

    // CREATE new record if it doesn't exist
    const id = crypto.randomUUID();
    const data = {
      id,
      tenantId: actor.tenantId,
      recordType: payload.recordType,
      hostname: normalizedHostname,
      value: payload.value,
      status: payload.status ?? 'ACTIVE',
      createdByUserId: actor.type === 'USER' ? actor.id : null,
      createdByEmployeeId: actor.type === 'EMPLOYEE' ? actor.id : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.insert(serverDetailTable).values(data);

    return data;
  }
}

export { ServerDetailService };
