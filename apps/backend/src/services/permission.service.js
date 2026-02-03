import { eq, and } from 'drizzle-orm';
import {
  roleTable,
  permissionTable,
  usersTable,
} from '../models/core/index.js';
import { db } from '../database/core/core-db.js';
import { ApiError } from '../lib/ApiError.js';

class PermissionService {
  async findAll(actor) {
    const { roleId, tenantId, isTenantOwner, ownedTenantId } = actor;

    const [role] = await db
      .select({ roleCode: roleTable.roleCode })
      .from(roleTable)
      .where(and(eq(roleTable.id, roleId), eq(roleTable.tenantId, tenantId)))
      .limit(1);

    if (!role) {
      throw ApiError.forbidden('Role not found');
    }

    if (isTenantOwner && ownedTenantId === tenantId) {
      return await db.select().from(permissionTable);
    }

    if (!isTenantOwner) {
      return await db
        .select()
        .from(permissionTable)
        .leftJoin(usersTable.permissionId)
        .where(eq(permissionTable.isActive, true));
    }

    return [];
  }
}

export default new PermissionService();
