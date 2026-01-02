import { eq, and } from 'drizzle-orm';
import { ApiError } from '../lib/ApiError.js';
import { db } from '../database/core/core-db.js';
import { auditLogTable } from '../models/core/auditLog.schema.js';

export class AuditLogService {
  // ================= CREATE =================
  static async create(payload) {
    await db.insert(auditLogTable).values(payload);
    return true;
  }

  // ================= GET ALL =================
  static async getAll(filters) {
    const conditions = [];

    if (filters.tenantId) {
      conditions.push(eq(auditLogTable.tenantId, filters.tenantId));
    }
    if (filters.entityType) {
      conditions.push(eq(auditLogTable.entityType, filters.entityType));
    }
    if (filters.entityId) {
      conditions.push(eq(auditLogTable.entityId, filters.entityId));
    }
    if (filters.action) {
      conditions.push(eq(auditLogTable.action, filters.action));
    }

    return db
      .select()
      .from(auditLogTable)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(auditLogTable.createdAt);
  }

  // ================= DELETE =================
  static async delete(id) {
    const result = await db
      .delete(auditLogTable)
      .where(eq(auditLogTable.id, id));

    if (!result[0]?.affectedRows) {
      throw ApiError.notFound('Audit log not found');
    }

    return true;
  }
}
