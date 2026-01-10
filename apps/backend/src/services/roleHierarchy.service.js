import { db } from '../database/core/core-db.js';
import { roleHierarchyTable, roleTable } from '../models/core/index.js';
import { eq, and, inArray } from 'drizzle-orm';
import { ApiError } from '../lib/ApiError.js';

class RoleHierarchyService {
  async create(payload, actor) {
    if (!actor?.tenantId) {
      throw ApiError.badRequest('Tenant missing');
    }

    const { parentRoleId, childRoleId } = payload;

    if (parentRoleId === childRoleId) {
      throw ApiError.badRequest('Parent and child role cannot be same');
    }

    // Actor role
    const [actorRole] = await db
      .select({ isSystem: roleTable.isSystem })
      .from(roleTable)
      .where(eq(roleTable.id, actor.roleId))
      .limit(1);

    if (!actorRole) {
      throw ApiError.forbidden('Invalid actor role');
    }

    // Validate roles exist in tenant
    const roles = await db
      .select({ id: roleTable.id })
      .from(roleTable)
      .where(
        and(
          eq(roleTable.tenantId, actor.tenantId),
          inArray(roleTable.id, [parentRoleId, childRoleId]),
        ),
      );

    if (roles.length !== 2) {
      throw ApiError.badRequest('Invalid role ids');
    }

    // Non-system user → hierarchy restriction
    if (!actorRole.isSystem) {
      const [allowed] = await db
        .select()
        .from(roleHierarchyTable)
        .where(
          and(
            eq(roleHierarchyTable.parentRoleId, actor.roleId),
            eq(roleHierarchyTable.childRoleId, parentRoleId),
            eq(roleHierarchyTable.tenantId, actor.tenantId),
          ),
        )
        .limit(1);

      if (!allowed) {
        throw ApiError.forbidden('You cannot create hierarchy for this role');
      }
    }

    // Prevent duplicate
    const [existing] = await db
      .select()
      .from(roleHierarchyTable)
      .where(
        and(
          eq(roleHierarchyTable.parentRoleId, parentRoleId),
          eq(roleHierarchyTable.childRoleId, childRoleId),
          eq(roleHierarchyTable.tenantId, actor.tenantId),
        ),
      )
      .limit(1);

    if (existing) {
      throw ApiError.conflict('Role hierarchy already exists');
    }

    await db.insert(roleHierarchyTable).values({
      parentRoleId,
      childRoleId,
      tenantId: actor.tenantId,
    });

    return { success: true };
  }

  async findAll(actor) {
    if (!actor?.tenantId) {
      throw ApiError.badRequest('Tenant missing');
    }

    return db
      .select()
      .from(roleHierarchyTable)
      .where(eq(roleHierarchyTable.tenantId, actor.tenantId));
  }

  async delete(payload, actor) {
    const { parentRoleId, childRoleId } = payload;

    const [actorRole] = await db
      .select({ isSystem: roleTable.isSystem })
      .from(roleTable)
      .where(eq(roleTable.id, actor.roleId))
      .limit(1);

    if (!actorRole?.isSystem) {
      throw ApiError.forbidden('Only system role can delete role hierarchy');
    }

    await db
      .delete(roleHierarchyTable)
      .where(
        and(
          eq(roleHierarchyTable.parentRoleId, parentRoleId),
          eq(roleHierarchyTable.childRoleId, childRoleId),
          eq(roleHierarchyTable.tenantId, actor.tenantId),
        ),
      );

    return { success: true };
  }
}

export default new RoleHierarchyService();
