import { eq, and, desc, sql } from 'drizzle-orm';
import { ApiError } from '../lib/ApiError.js';
import { db } from '../database/core/core-db.js';
import { auditLogTable } from '../models/core/index.js';

export class AuditLogService {
  //  CREATE AUDIT LOG (INTERNAL USE ONLY)
  static async create(payload) {
    if (!payload?.tenantId || !payload?.action || !payload?.entityType) {
      throw ApiError.badRequest('Invalid audit log payload');
    }

    await db.insert(auditLogTable).values({
      ...payload,
      createdAt: payload.createdAt ?? new Date(),
    });

    return true;
  }

  //  GET ALL AUDIT LOGS (TENANT SAFE + PAGINATED)
  static async getAll(filters = {}, actor) {
    if (!actor?.tenantId) {
      throw ApiError.forbidden('Tenant context missing');
    }

    const {
      tenantId,
      entityType,
      entityId,
      action,
      limit = 20,
      page = 1,
    } = filters;

    const safeLimit = Math.min(Number(limit) || 20, 100);
    const safePage = Number(page) || 1;
    const offset = (safePage - 1) * safeLimit;

    const conditions = [
      eq(auditLogTable.tenantId, actor.tenantId),
      sql`${auditLogTable.deletedAt} IS NULL`,
    ];

    // ❗ Never allow cross-tenant read
    if (tenantId && tenantId !== actor.tenantId) {
      throw ApiError.forbidden('Cross-tenant audit access denied');
    }

    if (entityType) {
      conditions.push(eq(auditLogTable.entityType, entityType));
    }

    if (entityId) {
      conditions.push(eq(auditLogTable.entityId, entityId));
    }

    if (action) {
      conditions.push(eq(auditLogTable.action, action));
    }

    const data = await db
      .select()
      .from(auditLogTable)
      .where(and(...conditions))
      .orderBy(desc(auditLogTable.createdAt))
      .limit(safeLimit)
      .offset(offset);

    const [{ total }] = await db
      .select({
        total: sql`COUNT(*)`.mapWith(Number),
      })
      .from(auditLogTable)
      .where(and(...conditions));

    return {
      data,
      meta: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit),
      },
    };
  }

  //  SOFT DELETE AUDIT LOG (ADMIN ONLY)
  static async delete(id, actor) {
    if (!actor?.tenantId || !actor?.isTenantOwner) {
      throw ApiError.forbidden('Only tenant owner can delete audit logs');
    }

    const [existing] = await db
      .select({ id: auditLogTable.id })
      .from(auditLogTable)
      .where(
        and(
          eq(auditLogTable.id, id),
          eq(auditLogTable.tenantId, actor.tenantId),
          sql`${auditLogTable.deletedAt} IS NULL`,
        ),
      )
      .limit(1);

    if (!existing) {
      throw ApiError.notFound('Audit log not found');
    }

    await db
      .update(auditLogTable)
      .set({
        deletedAt: new Date(),
      })
      .where(eq(auditLogTable.id, id));

    return true;
  }
}
