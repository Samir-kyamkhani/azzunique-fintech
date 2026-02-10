import { eq, and } from 'drizzle-orm';
import {
  roleTable,
  permissionTable,
  usersTable,
  userPermissionTable,
  rolePermissionTable,
} from '../models/core/index.js';
import { db } from '../database/core/core-db.js';
import { ApiError } from '../lib/ApiError.js';

class PermissionService {
  async findAll(actor) {
    const { roleId, id: userId } = actor;

    const [role] = await db
      .select({ roleCode: roleTable.roleCode })
      .from(roleTable)
      .where(eq(roleTable.id, roleId))
      .limit(1);

    if (!role) throw ApiError.forbidden('Role not found');

    // 🔥 SYSTEM USER
    if (role?.roleCode === 'AZZUNIQUE') {
      return await db
        .select()
        .from(permissionTable)
        .where(eq(permissionTable.isActive, true));
    }

    // 🔥 ROLE PERMISSIONS
    const rolePerms = await db
      .select({
        id: permissionTable.id,
        resource: permissionTable.resource,
        action: permissionTable.action,
      })
      .from(rolePermissionTable)
      .innerJoin(
        permissionTable,
        eq(permissionTable.id, rolePermissionTable.permissionId),
      )
      .where(
        and(
          eq(rolePermissionTable.roleId, roleId),
          eq(permissionTable.isActive, true),
        ),
      );

    // 🔥 USER OVERRIDES
    const userPerms = await db
      .select({
        permissionId: userPermissionTable.permissionId,
        effect: userPermissionTable.effect,
        resource: permissionTable.resource,
        action: permissionTable.action,
      })
      .from(userPermissionTable)
      .innerJoin(
        permissionTable,
        eq(permissionTable.id, userPermissionTable.permissionId),
      )
      .where(eq(userPermissionTable.userId, userId));

    // 🧠 MERGE
    const final = new Map();

    rolePerms.forEach((p) => final.set(p.id, p));

    userPerms.forEach((p) => {
      if (p.effect === 'DENY') {
        final.delete(p.permissionId);
      } else {
        final.set(p.permissionId, {
          id: p.permissionId,
          resource: p.resource,
          action: p.action,
        });
      }
    });

    return Array.from(final.values());
  }
}

export default new PermissionService();
