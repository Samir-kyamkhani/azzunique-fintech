import { db } from '../database/core/core-db.js';
import {
  userCommissionSettingTable,
  roleCommissionSettingTable,
} from '../models/core/index.js';
import { and, eq } from 'drizzle-orm';
import crypto from 'crypto';
import { ApiError } from '../lib/ApiError.js';
import { canSetCommission } from '../guard/commission.guard.js';

class CommissionSettingService {
  // USER COMMISSION
  static async setUserRule(payload, actor) {
    if (!actor.tenantId) {
      throw ApiError.badRequest('Tenant missing');
    }

    // 1️⃣ Actor role
    const [actorRole] = await db
      .select({ roleLevel: roleTable.roleLevel })
      .from(roleTable)
      .where(eq(roleTable.id, actor.roleId))
      .limit(1);

    if (!actorRole) {
      throw ApiError.forbidden('Invalid actor role');
    }

    // 2️⃣ Target user + role
    const [targetUser] = await db
      .select({
        roleId: usersTable.roleId,
      })
      .from(usersTable)
      .where(eq(usersTable.id, payload.userId))
      .limit(1);

    if (!targetUser) {
      throw ApiError.notFound('Target user not found');
    }

    const [targetRole] = await db
      .select({ roleLevel: roleTable.roleLevel })
      .from(roleTable)
      .where(eq(roleTable.id, targetUser.roleId))
      .limit(1);

    // 3️⃣ 🔒 COMMISSION CONTROL GUARD
    if (
      !canSetCommission({
        actorRoleLevel: actorRole.roleLevel,
        targetRoleLevel: targetRole.roleLevel,
      })
    ) {
      throw ApiError.forbidden(
        'You are not allowed to set commission for this user',
      );
    }

    // 4️⃣ UPSERT COMMISSION RULE
    await db
      .insert(userCommissionSettingTable)
      .values({
        id: crypto.randomUUID(),
        tenantId: actor.tenantId,
        ...payload,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .onDuplicateKeyUpdate({
        set: {
          ...payload,
          updatedAt: new Date(),
        },
      });

    return { success: true };
  }

  // ROLE COMMISSION
  static async setRoleRule(payload, actor) {
    if (!actor.tenantId) {
      throw ApiError.badRequest('Tenant missing');
    }

    // 1️⃣ Actor role
    const [actorRole] = await db
      .select({ roleLevel: roleTable.roleLevel })
      .from(roleTable)
      .where(eq(roleTable.id, actor.roleId))
      .limit(1);

    if (!actorRole) {
      throw ApiError.forbidden('Invalid actor role');
    }

    // 2️⃣ Target role
    const [targetRole] = await db
      .select({ roleLevel: roleTable.roleLevel })
      .from(roleTable)
      .where(eq(roleTable.id, payload.roleId))
      .limit(1);

    if (!targetRole) {
      throw ApiError.notFound('Target role not found');
    }

    // 3️⃣ 🔒 COMMISSION CONTROL GUARD
    if (
      !canSetCommission({
        actorRoleLevel: actorRole.roleLevel,
        targetRoleLevel: targetRole.roleLevel,
      })
    ) {
      throw ApiError.forbidden(
        'You are not allowed to set commission for this role',
      );
    }

    // 4️⃣ UPSERT COMMISSION RULE
    await db
      .insert(roleCommissionSettingTable)
      .values({
        id: crypto.randomUUID(),
        tenantId: actor.tenantId,
        ...payload,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .onDuplicateKeyUpdate({
        set: {
          ...payload,
          updatedAt: new Date(),
        },
      });

    return { success: true };
  }

  // RESOLVE COMMISSION (USER → ROLE)
  static async resolveForUser({
    tenantId,
    userId,
    roleId,
    platformServiceFeatureId,
  }) {
    const [userRule] = await db
      .select()
      .from(userCommissionSettingTable)
      .where(
        and(
          eq(userCommissionSettingTable.tenantId, tenantId),
          eq(userCommissionSettingTable.userId, userId),
          eq(
            userCommissionSettingTable.platformServiceFeatureId,
            platformServiceFeatureId,
          ),
          eq(userCommissionSettingTable.isActive, true),
        ),
      )
      .limit(1);

    if (userRule) return userRule;

    const [roleRule] = await db
      .select()
      .from(roleCommissionSettingTable)
      .where(
        and(
          eq(roleCommissionSettingTable.tenantId, tenantId),
          eq(roleCommissionSettingTable.roleId, roleId),
          eq(
            roleCommissionSettingTable.platformServiceFeatureId,
            platformServiceFeatureId,
          ),
          eq(roleCommissionSettingTable.isActive, true),
        ),
      )
      .limit(1);

    if (roleRule) return roleRule;

    throw ApiError.notFound('Commission rule not configured');
  }
}

export default CommissionSettingService;
