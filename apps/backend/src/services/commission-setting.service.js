import { db } from '../database/core/core-db.js';
import {
  commissionSettingTable,
  platformServiceFeatureTable,
  platformServiceTable,
  roleTable,
  usersTable,
} from '../models/core/index.js';
import { and, eq, desc, count, or } from 'drizzle-orm';
import crypto from 'crypto';
import { ApiError } from '../lib/ApiError.js';
import { canSetCommission } from '../guard/commission.guard.js';

class CommissionSettingService {
  //  SET COMMISSION
  static async setRule(payload, actor) {
    if (!actor.tenantId) {
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

    let targetRoleLevel;

    if (payload.scope === 'USER') {
      const [targetUser] = await db
        .select({ roleId: usersTable.roleId })
        .from(usersTable)
        .where(eq(usersTable.id, payload.targetUserId))
        .limit(1);

      if (!targetUser) {
        throw ApiError.notFound('Target user not found');
      }

      const [targetRole] = await db
        .select({ roleLevel: roleTable.roleLevel })
        .from(roleTable)
        .where(eq(roleTable.id, targetUser.roleId))
        .limit(1);

      targetRoleLevel = targetRole?.roleLevel;
    }

    if (payload.scope === 'ROLE') {
      const [targetRole] = await db
        .select({ roleLevel: roleTable.roleLevel })
        .from(roleTable)
        .where(eq(roleTable.id, payload.roleId))
        .limit(1);

      if (!targetRole) {
        throw ApiError.notFound('Target role not found');
      }

      targetRoleLevel = targetRole.roleLevel;
    }

    if (
      !canSetCommission({
        actorRoleLevel: actorRole.roleLevel,
        targetRoleLevel,
      })
    ) {
      throw ApiError.forbidden(
        'You are not allowed to set commission for this target',
      );
    }

    await db
      .insert(commissionSettingTable)
      .values({
        id: crypto.randomUUID(),
        tenantId: actor.tenantId,
        scope: payload.scope,

        roleId: payload.scope === 'ROLE' ? payload.roleId : null,
        targetUserId: payload.scope === 'USER' ? payload.targetUserId : null,

        platformServiceId: payload.platformServiceId,
        platformServiceFeatureId: payload.platformServiceFeatureId,

        mode: payload.mode,
        type: payload.type,
        value: payload.value,

        minAmount: payload.minAmount ?? 0,
        maxAmount: payload.maxAmount ?? 0,

        applyTDS: payload.applyTDS ?? false,
        tdsPercent: payload.tdsPercent ?? null,

        applyGST: payload.applyGST ?? false,
        gstPercent: payload.gstPercent ?? null,

        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .onDuplicateKeyUpdate({
        set: {
          type: payload.type,
          value: payload.value,
          minAmount: payload.minAmount ?? 0,
          maxAmount: payload.maxAmount ?? 0,
          applyTDS: payload.applyTDS ?? false,
          tdsPercent: payload.tdsPercent ?? null,
          applyGST: payload.applyGST ?? false,
          gstPercent: payload.gstPercent ?? null,
          updatedAt: new Date(),
        },
      });

    return { success: true };
  }

  //  GET COMMISSION LIST (USER + ROLE)
  static async getCommissionList(actor, query = {}) {
    const { tenantId } = actor;

    const page = Number(query.page) || 1;
    const limit = Math.min(Number(query.limit) || 10, 100);
    const offset = (page - 1) * limit;

    const rows = await db
      .select({
        id: commissionSettingTable.id,
        tenantId: commissionSettingTable.tenantId,
        scope: commissionSettingTable.scope,
        roleId: commissionSettingTable.roleId,
        targetUserId: commissionSettingTable.targetUserId,

        platformServiceId: commissionSettingTable.platformServiceId,
        platformServiceFeatureId:
          commissionSettingTable.platformServiceFeatureId,

        mode: commissionSettingTable.mode,
        type: commissionSettingTable.type,
        value: commissionSettingTable.value,

        minAmount: commissionSettingTable.minAmount,
        maxAmount: commissionSettingTable.maxAmount,

        applyTDS: commissionSettingTable.applyTDS,
        tdsPercent: commissionSettingTable.tdsPercent,

        applyGST: commissionSettingTable.applyGST,
        gstPercent: commissionSettingTable.gstPercent,

        isActive: commissionSettingTable.isActive,

        createdAt: commissionSettingTable.createdAt,
        updatedAt: commissionSettingTable.updatedAt,

        // 🔥 extra fields
        roleName: roleTable.roleName,
        roleCode: roleTable.roleCode,

        platformServiceName: platformServiceTable.name,
        platformServiceFeatureName: platformServiceFeatureTable.name,
      })
      .from(commissionSettingTable)

      .leftJoin(roleTable, eq(commissionSettingTable.roleId, roleTable.id))

      .leftJoin(
        platformServiceTable,
        eq(commissionSettingTable.platformServiceId, platformServiceTable.id),
      )

      .leftJoin(
        platformServiceFeatureTable,
        eq(
          commissionSettingTable.platformServiceFeatureId,
          platformServiceFeatureTable.id,
        ),
      )

      .where(eq(commissionSettingTable.tenantId, tenantId))

      .orderBy(desc(commissionSettingTable.createdAt))
      .limit(limit)
      .offset(offset);

    const [{ total }] = await db
      .select({ total: count() })
      .from(commissionSettingTable)
      .where(eq(commissionSettingTable.tenantId, tenantId));

    return {
      data: rows,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
  // RESOLVE COMMISSION (USER → ROLE)
  static async resolveForUser({
    tenantId,
    userId,
    roleId,
    platformServiceId,
    platformServiceFeatureId,
    amount,
  }) {
    const now = new Date();

    /* ================= BASE CONDITIONS ================= */

    const baseConditions = [
      eq(commissionSettingTable.tenantId, tenantId),
      eq(commissionSettingTable.platformServiceId, platformServiceId),
      eq(
        commissionSettingTable.platformServiceFeatureId,
        platformServiceFeatureId,
      ),
      eq(commissionSettingTable.isActive, true),
    ];

    /* ================= SLAB CONDITIONS ================= */

    const slabConditions =
      typeof amount === 'number'
        ? [
            lte(commissionSettingTable.minAmount, amount),
            or(
              eq(commissionSettingTable.maxAmount, 0),
              gte(commissionSettingTable.maxAmount, amount),
            ),
          ]
        : [];

    /* ================= USER LEVEL ================= */

    if (userId) {
      const [userRule] = await db
        .select()
        .from(commissionSettingTable)
        .where(
          and(
            ...baseConditions,
            eq(commissionSettingTable.scope, 'USER'),
            eq(commissionSettingTable.targetUserId, userId),
            ...slabConditions,
          ),
        )
        .orderBy(desc(commissionSettingTable.minAmount))
        .limit(1);

      if (userRule) return userRule;
    }

    /* ================= ROLE LEVEL ================= */

    if (roleId) {
      const [roleRule] = await db
        .select()
        .from(commissionSettingTable)
        .where(
          and(
            ...baseConditions,
            eq(commissionSettingTable.scope, 'ROLE'),
            eq(commissionSettingTable.roleId, roleId),
            ...slabConditions,
          ),
        )
        .orderBy(desc(commissionSettingTable.minAmount))
        .limit(1);

      if (roleRule) return roleRule;
    }

    return null;
  }
}

export default CommissionSettingService;
