import { db } from '../database/core/core-db.js';
import {
  roleTable,
  rolePermissionTable,
  permissionTable,
  usersTable,
} from '../models/core/index.js';
import { eq, and, ne, sql, inArray } from 'drizzle-orm';
import { ApiError } from '../lib/ApiError.js';
import crypto from 'crypto';
import { resolvePermissions } from './permission.resolver.js';

class RoleService {
  async create(payload, actor) {
    if (!actor?.tenantId) {
      throw ApiError.badRequest('Tenant missing');
    }

    const [actorRole] = await db
      .select({ roleLevel: roleTable.roleLevel })
      .from(roleTable)
      .where(eq(roleTable.id, actor.roleId))
      .limit(1);

    if (!actorRole) {
      throw ApiError.forbidden('Invalid actor role');
    }

    // Role code uniqueness
    const [existingCode] = await db
      .select({ id: roleTable.id })
      .from(roleTable)
      .where(
        and(
          eq(roleTable.tenantId, actor.tenantId),
          eq(roleTable.roleCode, payload.roleCode),
        ),
      )
      .limit(1);

    if (existingCode) {
      throw ApiError.conflict('Role code already exists');
    }

    const newRoleLevel = actorRole.roleLevel + 1;

    const [levelExists] = await db
      .select({ id: roleTable.id })
      .from(roleTable)
      .where(
        and(
          eq(roleTable.tenantId, actor.tenantId),
          eq(roleTable.roleLevel, newRoleLevel),
        ),
      )
      .limit(1);

    if (levelExists) {
      throw ApiError.conflict(
        `Role level ${newRoleLevel} already exists in this tenant`,
      );
    }

    const id = crypto.randomUUID();

    await db.insert(roleTable).values({
      id,
      roleCode: payload.roleCode,
      roleName: payload.roleName,
      roleDescription: payload.roleDescription,

      roleLevel: newRoleLevel,

      tenantId: actor.tenantId,
      isSystem: false,

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

    const conditions = [eq(roleTable.tenantId, actor.tenantId)];

    //  prevent self-lock
    if (actor.roleId) {
      conditions.push(ne(roleTable.id, actor.roleId));
    }

    const rows = await db
      .select({
        roleId: roleTable.id,
        roleCode: roleTable.roleCode,
        roleName: roleTable.roleName,
        roleDescription: roleTable.roleDescription,
        isSystem: roleTable.isSystem,
        permissionId: permissionTable.id,
        resource: permissionTable.resource,
        action: permissionTable.action,
      })
      .from(roleTable)
      .leftJoin(
        rolePermissionTable,
        eq(rolePermissionTable.roleId, roleTable.id),
      )
      .leftJoin(
        permissionTable,
        eq(permissionTable.id, rolePermissionTable.permissionId),
      )
      .where(and(...conditions));

    const roleMap = new Map();

    for (const r of rows) {
      if (!roleMap.has(r.roleId)) {
        roleMap.set(r.roleId, {
          id: r.roleId,
          roleCode: r.roleCode,
          roleName: r.roleName,
          roleDescription: r.roleDescription,
          isSystem: r.isSystem,
          permissions: [],
        });
      }

      if (r.permissionId) {
        roleMap.get(r.roleId).permissions.push({
          id: r.permissionId,
          resource: r.resource,
          action: r.action,
        });
      }
    }

    return [...roleMap.values()];
  }

  async findOne(id, actor) {
    const rows = await db
      .select({
        roleId: roleTable.id,
        roleCode: roleTable.roleCode,
        roleName: roleTable.roleName,
        roleDescription: roleTable.roleDescription,
        isSystem: roleTable.isSystem,
        permissionId: permissionTable.id,
        resource: permissionTable.resource,
        action: permissionTable.action,
      })
      .from(roleTable)
      .leftJoin(
        rolePermissionTable,
        eq(rolePermissionTable.roleId, roleTable.id),
      )
      .leftJoin(
        permissionTable,
        eq(permissionTable.id, rolePermissionTable.permissionId),
      )
      .where(and(eq(roleTable.id, id), eq(roleTable.tenantId, actor.tenantId)));

    if (!rows.length) {
      throw ApiError.notFound('Role not found');
    }

    return {
      id: rows[0].roleId,
      roleCode: rows[0].roleCode,
      roleName: rows[0].roleName,
      roleDescription: rows[0].roleDescription,
      isSystem: rows[0].isSystem,
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
    if (!actor?.tenantId) {
      throw ApiError.badRequest('Tenant context missing');
    }

    const role = await this.findOne(id, actor);

    if (role.isSystem) {
      throw ApiError.forbidden('System roles cannot be modified');
    }

    if (actor.roleId === id) {
      if (payload.roleCode || payload.isSystem) {
        throw ApiError.forbidden('You cannot modify your own role');
      }
    }

    delete payload.isSystem;
    delete payload.tenantId;

    // 🔁 Role code uniqueness check (if changed)
    if (payload.roleCode && payload.roleCode !== role.roleCode) {
      const [existing] = await db
        .select({ id: roleTable.id })
        .from(roleTable)
        .where(
          and(
            eq(roleTable.tenantId, actor.tenantId),
            eq(roleTable.roleCode, payload.roleCode),
            ne(roleTable.id, id),
          ),
        )
        .limit(1);

      if (existing) {
        throw ApiError.conflict('Role code already exists in this tenant');
      }
    }

    await db
      .update(roleTable)
      .set({
        ...payload,
        updatedAt: new Date(),
      })
      .where(and(eq(roleTable.id, id), eq(roleTable.tenantId, actor.tenantId)));

    return this.findOne(id, actor);
  }

  async delete(id, actor) {
    const role = await this.findOne(id, actor);

    if (role.isSystem) {
      throw ApiError.forbidden('System roles cannot be deleted');
    }

    if (actor.roleId === id) {
      throw ApiError.forbidden('You cannot delete your own role');
    }

    const [{ count }] = await db
      .select({ count: sql`COUNT(*)`.mapWith(Number) })
      .from(usersTable)
      .where(
        and(eq(usersTable.roleId, id), eq(usersTable.tenantId, actor.tenantId)),
      );

    if (count > 0) {
      throw ApiError.conflict(
        `Role is assigned to ${count} user(s). Please delete users first.`,
      );
    }

    await db
      .delete(rolePermissionTable)
      .where(eq(rolePermissionTable.roleId, id));

    await db.delete(roleTable).where(eq(roleTable.id, id));
  }

  async assignPermissions(roleId, permissionIds, actor) {
    const role = await this.findOne(roleId, actor);

    if (role.isSystem) {
      throw ApiError.forbidden('System role permissions cannot be modified');
    }

    if (!Array.isArray(permissionIds)) {
      throw ApiError.badRequest('permissionIds must be an array');
    }

    const existing = await db
      .select({ id: permissionTable.id })
      .from(permissionTable)
      .where(inArray(permissionTable.id, permissionIds));

    const existingIds = existing.map((p) => p.id);

    if (existingIds.length !== permissionIds.length) {
      throw ApiError.badRequest('One or more permission IDs are invalid');
    }

    const actorPerms = await resolvePermissions(actor);

    if (!actorPerms.includes('*') && actor.roleId === roleId) {
      throw ApiError.forbidden(
        'You cannot modify permissions of your own role',
      );
    }

    if (!actorPerms.includes('*')) {
      const forbidden = existingIds.filter((pid) => !actorPerms.includes(pid));
      if (forbidden.length) {
        throw ApiError.forbidden(
          'You cannot assign permissions you do not have',
        );
      }
    }

    await db
      .delete(rolePermissionTable)
      .where(eq(rolePermissionTable.roleId, roleId));

    if (!existingIds.length) return;

    await db.insert(rolePermissionTable).values(
      existingIds.map((pid) => ({
        id: crypto.randomUUID(),
        roleId,
        permissionId: pid,
      })),
    );
  }
}

export default new RoleService();
