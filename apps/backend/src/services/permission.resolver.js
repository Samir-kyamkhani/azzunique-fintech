import { db } from '../database/core/core-db.js';
import {
  roleTable,
  rolePermissionTable,
  userPermissionTable,
  departmentPermissionTable,
  employeePermissionTable,
  permissionTable,
} from '../models/core/index.js';
import { eq, sql } from 'drizzle-orm';
import { ApiError } from '../lib/ApiError.js';

export async function resolvePermissions(actor) {
  if (!actor || !actor.tenantId) {
    return [];
  }

  const permissions = new Set();

  if (actor.type === 'USER') {
    const [role] = await db
      .select({
        id: roleTable.id,
        isSystem: roleTable.isSystem,
      })
      .from(roleTable)
      .where(eq(roleTable.id, actor.roleId))
      .limit(1);

    if (!role) {
      return [];
    }

    // 🔑 SYSTEM ROLE
    if (role.isSystem) {
      if (!actor.isTenantOwner) {
        throw ApiError.forbidden('System role restricted to tenant owners');
      }
      return ['*'];
    }

    const rolePerms = await db
      .select({
        key: sql`CONCAT(${permissionTable.resource}, '.', ${permissionTable.action})`,
      })
      .from(rolePermissionTable)
      .leftJoin(
        permissionTable,
        eq(permissionTable.id, rolePermissionTable.permissionId),
      )
      .where(eq(rolePermissionTable.roleId, actor.roleId));

    rolePerms.forEach((p) => {
      if (p.key) permissions.add(p.key);
    });

    const userPerms = await db
      .select({
        key: sql`CONCAT(${permissionTable.resource}, '.', ${permissionTable.action})`,
        effect: userPermissionTable.effect,
      })
      .from(userPermissionTable)
      .leftJoin(
        permissionTable,
        eq(permissionTable.id, userPermissionTable.permissionId),
      )
      .where(eq(userPermissionTable.userId, actor.id));

    userPerms.forEach((p) => {
      if (!p.key) return;

      p.effect === 'ALLOW' ? permissions.add(p.key) : permissions.delete(p.key);
    });
  }

  if (actor.type === 'EMPLOYEE') {
    const deptPerms = await db
      .select({
        key: sql`CONCAT(${permissionTable.resource}, '.', ${permissionTable.action})`,
      })
      .from(departmentPermissionTable)
      .leftJoin(
        permissionTable,
        eq(permissionTable.id, departmentPermissionTable.permissionId),
      )
      .where(eq(departmentPermissionTable.departmentId, actor.departmentId));

    deptPerms.forEach((p) => {
      if (p.key) permissions.add(p.key);
    });

    const empPerms = await db
      .select({
        key: sql`CONCAT(${permissionTable.resource}, '.', ${permissionTable.action})`,
        effect: employeePermissionTable.effect,
      })
      .from(employeePermissionTable)
      .leftJoin(
        permissionTable,
        eq(permissionTable.id, employeePermissionTable.permissionId),
      )
      .where(eq(employeePermissionTable.employeeId, actor.id));

    empPerms.forEach((p) => {
      if (!p.key) return;

      p.effect === 'ALLOW' ? permissions.add(p.key) : permissions.delete(p.key);
    });
  }

  return [...permissions];
}
