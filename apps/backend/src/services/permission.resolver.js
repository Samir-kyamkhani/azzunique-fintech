import { db } from '../database/core/core-db.js';
import {
  roleTable,
  rolePermissionTable,
  userPermissionTable,
  departmentPermissionTable,
  employeePermissionTable,
} from '../models/core/index.js';
import { eq } from 'drizzle-orm';

export async function resolvePermissions(actor) {
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

    //  SYSTEM ROLE → SKIP PERMISSIONS
    if (role.isSystem) {
      return ['*'];
    }

    // Role permissions
    const rolePerms = await db
      .select({ permissionId: rolePermissionTable.permissionId })
      .from(rolePermissionTable)
      .where(eq(rolePermissionTable.roleId, actor.roleId));

    rolePerms.forEach((p) => permissions.add(p.permissionId));

    // User overrides
    const userPerms = await db
      .select()
      .from(userPermissionTable)
      .where(eq(userPermissionTable.userId, actor.id));

    userPerms.forEach((p) => {
      p.effect === 'ALLOW'
        ? permissions.add(p.permissionId)
        : permissions.delete(p.permissionId);
    });
  }

  //  EMPLOYEE PERMISSIONS
  if (actor.type === 'EMPLOYEE') {
    const deptPerms = await db
      .select({ permissionId: departmentPermissionTable.permissionId })
      .from(departmentPermissionTable)
      .where(eq(departmentPermissionTable.departmentId, actor.departmentId));

    deptPerms.forEach((p) => permissions.add(p.permissionId));

    const empPerms = await db
      .select()
      .from(employeePermissionTable)
      .where(eq(employeePermissionTable.employeeId, actor.id));

    empPerms.forEach((p) => {
      p.effect === 'ALLOW'
        ? permissions.add(p.permissionId)
        : permissions.delete(p.permissionId);
    });
  }

  return [...permissions];
}
