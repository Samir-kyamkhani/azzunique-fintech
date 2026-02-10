import { db } from '../database/core/core-db.js';
import {
  departmentTable,
  departmentPermissionTable,
  permissionTable,
  employeesTable,
} from '../models/core/index.js';
import { eq, and, inArray, sql } from 'drizzle-orm';
import crypto from 'crypto';
import { ApiError } from '../lib/ApiError.js';
import { resolvePermissions } from './permission.resolver.js';

class DepartmentService {
  async create(payload, actor) {
    if (!actor?.tenantId) {
      throw ApiError.badRequest('Tenant missing');
    }

    const [existing] = await db
      .select({ id: departmentTable.id })
      .from(departmentTable)
      .where(
        and(
          eq(departmentTable.tenantId, actor.tenantId),
          eq(departmentTable.departmentCode, payload.departmentCode),
        ),
      )
      .limit(1);

    if (existing) {
      throw ApiError.conflict('Department already exists');
    }

    const id = crypto.randomUUID();

    await db.insert(departmentTable).values({
      id,
      ...payload,
      tenantId: actor.tenantId,
      createdByUserId: actor.type === 'USER' ? actor.id : null,
      createdByEmployeeId: actor.type === 'EMPLOYEE' ? actor.id : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return this.findOne(id, actor);
  }

  async findAll(actor) {
    if (!actor?.tenantId) {
      throw ApiError.badRequest('Tenant context missing');
    }

    const rows = await db
      .select({
        departmentId: departmentTable.id,
        departmentCode: departmentTable.departmentCode,
        departmentName: departmentTable.departmentName,
        departmentDescription: departmentTable.departmentDescription,

        permissionId: permissionTable.id,
        resource: permissionTable.resource,
        action: permissionTable.action,
      })
      .from(departmentTable)
      .leftJoin(
        departmentPermissionTable,
        eq(departmentPermissionTable.departmentId, departmentTable.id),
      )
      .leftJoin(
        permissionTable,
        eq(permissionTable.id, departmentPermissionTable.permissionId),
      )
      .where(eq(departmentTable.tenantId, actor.tenantId));

    const deptMap = new Map();

    for (const r of rows) {
      if (!deptMap.has(r.departmentId)) {
        deptMap.set(r.departmentId, {
          id: r.departmentId,
          departmentCode: r.departmentCode,
          departmentName: r.departmentName,
          departmentDescription: r.departmentDescription,
          permissions: [],
        });
      }

      if (r.permissionId) {
        deptMap.get(r.departmentId).permissions.push({
          id: r.permissionId,
          resource: r.resource,
          action: r.action,
        });
      }
    }

    return [...deptMap.values()];
  }

  async findOne(id, actor) {
    const rows = await db
      .select({
        departmentId: departmentTable.id,
        departmentCode: departmentTable.departmentCode,
        departmentName: departmentTable.departmentName,
        departmentDescription: departmentTable.departmentDescription,
        permissionId: permissionTable.id,
        resource: permissionTable.resource,
        action: permissionTable.action,
      })
      .from(departmentTable)
      .leftJoin(
        departmentPermissionTable,
        eq(departmentPermissionTable.departmentId, departmentTable.id),
      )
      .leftJoin(
        permissionTable,
        eq(permissionTable.id, departmentPermissionTable.permissionId),
      )
      .where(
        and(
          eq(departmentTable.id, id),
          eq(departmentTable.tenantId, actor.tenantId),
        ),
      );

    if (!rows.length) {
      throw ApiError.notFound('Department not found');
    }

    return {
      id: rows[0].departmentId,
      departmentCode: rows[0].departmentCode,
      departmentName: rows[0].departmentName,
      departmentDescription: rows[0].departmentDescription,
      permissions: rows
        .filter((r) => r.permissionId)
        .map((r) => ({
          id: r.permissionId,
          resource: r.resource,
          action: r.action,
        })),
    };
  }

  async update(id, payload, actor) {
    await this.findOne(id, actor);

    await db
      .update(departmentTable)
      .set({ ...payload, updatedAt: new Date() })
      .where(eq(departmentTable.id, id));

    return this.findOne(id, actor);
  }

  async delete(id, actor) {
    await this.findOne(id, actor);

    const [{ count }] = await db
      .select({ count: sql`COUNT(*)`.mapWith(Number) })
      .from(employeesTable)
      .where(
        and(
          eq(employeesTable.departmentId, id),
          eq(employeesTable.tenantId, actor.tenantId),
        ),
      );

    if (count > 0) {
      throw ApiError.conflict(
        `Department has ${count} employee(s). Delete them first.`,
      );
    }

    await db
      .delete(departmentPermissionTable)
      .where(eq(departmentPermissionTable.departmentId, id));

    await db.delete(departmentTable).where(eq(departmentTable.id, id));
  }

  async assignPermissions(departmentId, permissionIds, actor) {
    if (!actor?.tenantId || !actor?.id) {
      throw ApiError.unauthorized('Invalid actor context');
    }

    if (!Array.isArray(permissionIds)) {
      throw ApiError.badRequest('permissionIds must be an array');
    }

    // 1️⃣ Department existence + tenant safety
    const [department] = await db
      .select({ id: departmentTable.id })
      .from(departmentTable)
      .where(
        and(
          eq(departmentTable.id, departmentId),
          eq(departmentTable.tenantId, actor.tenantId),
        ),
      )
      .limit(1);

    if (!department) {
      throw ApiError.notFound('Department not found');
    }

    // 2️⃣ Validate permission IDs
    const existing = await db
      .select({ id: permissionTable.id })
      .from(permissionTable)
      .where(inArray(permissionTable.id, permissionIds));

    const existingIds = existing.map((p) => p.id);

    if (existingIds.length !== permissionIds.length) {
      throw ApiError.badRequest('One or more permission IDs are invalid');
    }

    // 3️⃣ Actor permission enforcement (CRITICAL)
    const actorPermissions = await resolvePermissions(actor);

    if (!actorPermissions.includes('*')) {
      const forbidden = existingIds.filter(
        (pid) => !actorPermissions.includes(pid),
      );

      if (forbidden.length) {
        throw ApiError.forbidden(
          'You cannot assign permissions you do not have',
        );
      }
    }

    // 4️⃣ Replace department permissions (CLEAR → INSERT)
    await db
      .delete(departmentPermissionTable)
      .where(eq(departmentPermissionTable.departmentId, departmentId));

    if (!existingIds.length) return true;

    await db.insert(departmentPermissionTable).values(
      existingIds.map((pid) => ({
        id: crypto.randomUUID(),
        departmentId,
        permissionId: pid,
      })),
    );

    return true;
  }
}

export default new DepartmentService();
