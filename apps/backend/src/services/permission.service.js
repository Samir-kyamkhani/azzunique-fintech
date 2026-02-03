import { eq, and } from 'drizzle-orm';
import {
  roleTable,
  permissionTable,
  userPermissionTable,
} from '../models/core/index.js';
import { db } from '../database/core/core-db.js';
import { ApiError } from '../lib/ApiError.js';

class PermissionService {
  async findAll(actor) {
    const {
      roleId,
      tenantId,
      isTenantOwner,
      ownedTenantId,
      id: userId,
    } = actor;

    // 1️⃣ Role verify
    const [role] = await db
      .select({ roleCode: roleTable.roleCode })
      .from(roleTable)
      .where(and(eq(roleTable.id, roleId), eq(roleTable.tenantId, tenantId)))
      .limit(1);

    if (!role) throw ApiError.forbidden('Role not found');

    // 2️⃣ Owners → full system permissions + user effect
    if (isTenantOwner && ownedTenantId === tenantId) {
      return await db
        .select({
          id: permissionTable.id,
          resource: permissionTable.resource,
          action: permissionTable.action,
          isActive: permissionTable.isActive,
          effect: userPermissionTable.effect,
        })
        .from(permissionTable)
        .leftJoin(
          userPermissionTable,
          and(
            eq(userPermissionTable.permissionId, permissionTable.id),
            eq(userPermissionTable.userId, userId),
          ),
        )
        .where(eq(permissionTable.isActive, true));
    }

    // 3️⃣ Employees → only active perms + user overrides
    return await db
      .select({
        id: permissionTable.id,
        resource: permissionTable.resource,
        action: permissionTable.action,
        isActive: permissionTable.isActive,
        effect: userPermissionTable.effect,
      })
      .from(permissionTable)
      .leftJoin(
        userPermissionTable,
        and(
          eq(userPermissionTable.permissionId, permissionTable.id),
          eq(userPermissionTable.userId, userId),
        ),
      )
      .where(eq(permissionTable.isActive, true));
  }
}

export default new PermissionService();
