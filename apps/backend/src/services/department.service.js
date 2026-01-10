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
    if (!actor.tenantId) {
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
      throw ApiError.conflict('Department code already exists in this tenant');
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
    return db
      .select()
      .from(departmentTable)
      .where(eq(departmentTable.tenantId, actor.tenantId));
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

    const department = {
      id: rows[0].departmentId,
      departmentCode: rows[0].departmentCode,
      departmentName: rows[0].departmentName,
      departmentDescription: rows[0].departmentDescription,
      permissions: [],
    };

    for (const row of rows) {
      if (row.permissionId) {
        department.permissions.push({
          id: row.permissionId,
          resource: row.resource,
          action: row.action,
        });
      }
    }

    return department;
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
      .where(eq(employeesTable.departmentId, id));

    if (count > 0) {
      throw ApiError.conflict(
        `Department is assigned to ${count} employee(s). Please delete employees first.`,
      );
    }

    await db
      .delete(departmentPermissionTable)
      .where(eq(departmentPermissionTable.departmentId, id));

    await db.delete(departmentTable).where(eq(departmentTable.id, id));
  }

  async assignPermissions(departmentId, permissionIds, actor) {
    await this.findOne(departmentId, actor);

    // Validate permission existence
    const existing = await db
      .select({ id: permissionTable.id })
      .from(permissionTable)
      .where(inArray(permissionTable.id, permissionIds));

    const existingIds = existing.map((p) => p.id);

    const invalidIds = permissionIds.filter(
      (pid) => !existingIds.includes(pid),
    );

    if (invalidIds.length > 0) {
      throw ApiError.badRequest(
        `Invalid permission id(s): ${invalidIds.join(', ')}`,
      );
    }

    // Actor permission check
    const actorPermissions = await resolvePermissions(actor);

    if (!actorPermissions.includes('*')) {
      const unauthorized = existingIds.filter(
        (pid) => !actorPermissions.includes(pid),
      );

      if (unauthorized.length > 0) {
        throw ApiError.forbidden(
          'You cannot assign permissions that you do not have',
        );
      }
    }

    await db
      .delete(departmentPermissionTable)
      .where(eq(departmentPermissionTable.departmentId, departmentId));

    await db.insert(departmentPermissionTable).values(
      existingIds.map((pid) => ({
        id: crypto.randomUUID(),
        departmentId,
        permissionId: pid,
      })),
    );
  }
}

export default new DepartmentService();
