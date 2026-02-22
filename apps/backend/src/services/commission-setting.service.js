import { db } from '../database/core/core-db.js';
import {
  userCommissionSettingTable,
  roleCommissionSettingTable,
  roleTable,
  usersTable,
  tenantsTable,
} from '../models/core/index.js';
import { and, eq, like, desc, count, or } from 'drizzle-orm';
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

  //  GET COMMISSION LIST (USER + ROLE)

  static async getCommissionList(actor, query = {}) {
    const { tenantId } = actor;

    let { type = 'ALL', search = '', isActive, page = 1, limit = 10 } = query;

    type = String(type).toUpperCase();
    page = Number(page);
    limit = Number(limit);
    const offset = (page - 1) * limit;

    /* ================= CONDITIONS ================= */
    const userConditions = [eq(userCommissionSettingTable.tenantId, tenantId)];
    const roleConditions = [eq(roleCommissionSettingTable.tenantId, tenantId)];

    if (isActive !== undefined) {
      const active = isActive === 'true' || isActive === true;
      userConditions.push(eq(userCommissionSettingTable.isActive, active));
      roleConditions.push(eq(roleCommissionSettingTable.isActive, active));
    }

    if (search) {
      userConditions.push(like(usersTable.firstName, `%${search}%`));
      userConditions.push(like(usersTable.lastName, `%${search}%`));
      userConditions.push(like(usersTable.userNumber, `%${search}%`));
      roleConditions.push(like(roleTable.roleCode, `%${search}%`));
    }

    /* ================= USER QUERY ================= */
    const userQuery = db
      .select({
        id: userCommissionSettingTable.id,

        // commission fields
        commissionType: userCommissionSettingTable.commissionType,
        commissionValue: userCommissionSettingTable.commissionValue,
        surchargeType: userCommissionSettingTable.surchargeType,
        surchargeValue: userCommissionSettingTable.surchargeValue,
        gstApplicable: userCommissionSettingTable.gstApplicable,
        gstRate: userCommissionSettingTable.gstRate,
        maxCommissionValue: userCommissionSettingTable.maxCommissionValue,
        isActive: userCommissionSettingTable.isActive,
        createdAt: userCommissionSettingTable.createdAt,

        // user info
        firstName: usersTable.firstName,
        lastName: usersTable.lastName,
        userNumber: usersTable.userNumber,

        // tenant info
        tenantNumber: tenantsTable.tenantNumber,
        tenantName: tenantsTable.tenantName,
      })
      .from(userCommissionSettingTable)
      .innerJoin(
        usersTable,
        eq(usersTable.id, userCommissionSettingTable.userId),
      )
      .innerJoin(tenantsTable, eq(tenantsTable.id, usersTable.tenantId))
      .where(and(...userConditions))
      .orderBy(desc(userCommissionSettingTable.createdAt));

    /* ================= ROLE QUERY ================= */
    const roleQuery = db
      .select({
        id: roleCommissionSettingTable.id,

        // commission fields
        commissionType: roleCommissionSettingTable.commissionType,
        commissionValue: roleCommissionSettingTable.commissionValue,
        surchargeType: roleCommissionSettingTable.surchargeType,
        surchargeValue: roleCommissionSettingTable.surchargeValue,
        gstApplicable: roleCommissionSettingTable.gstApplicable,
        gstRate: roleCommissionSettingTable.gstRate,
        maxCommissionValue: roleCommissionSettingTable.maxCommissionValue,
        isActive: roleCommissionSettingTable.isActive,
        createdAt: roleCommissionSettingTable.createdAt,

        // role info
        roleCode: roleTable.roleCode,
      })
      .from(roleCommissionSettingTable)
      .innerJoin(roleTable, eq(roleTable.id, roleCommissionSettingTable.roleId))
      .where(and(...roleConditions))
      .orderBy(desc(roleCommissionSettingTable.createdAt));

    let data = [];
    let total = 0;

    /* ================= TYPE USER ================= */
    if (type === 'USER') {
      const rows = await userQuery.limit(limit).offset(offset);
      data = rows.map((r) => ({ ...r, type: 'USER' }));

      const [{ totalCount }] = await db
        .select({ totalCount: count() })
        .from(userCommissionSettingTable)
        .where(and(...userConditions));

      total = Number(totalCount);
    } else if (type === 'ROLE') {
      /* ================= TYPE ROLE ================= */
      const rows = await roleQuery.limit(limit).offset(offset);
      data = rows.map((r) => ({ ...r, type: 'ROLE' }));

      const [{ totalCount }] = await db
        .select({ totalCount: count() })
        .from(roleCommissionSettingTable)
        .where(and(...roleConditions));

      total = Number(totalCount);
    } else {
      /* ================= TYPE ALL ================= */
      const [userRows, roleRows] = await Promise.all([userQuery, roleQuery]);

      const users = userRows.map((r) => ({ ...r, type: 'USER' }));
      const roles = roleRows.map((r) => ({ ...r, type: 'ROLE' }));

      const combined = [...users, ...roles].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );

      total = combined.length;
      data = combined.slice(offset, offset + limit);
    }

    return {
      data,
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
  }) {
    console.log(
      tenantId,
      userId,
      roleId,
      platformServiceId,
      platformServiceFeatureId,
    );
    try {
      // 1️⃣ USER LEVEL CHECK
      const [userRule] = await db
        .select()
        .from(userCommissionSettingTable)
        .where(
          and(
            eq(userCommissionSettingTable.tenantId, tenantId),
            eq(userCommissionSettingTable.userId, userId),
            or(
              eq(
                userCommissionSettingTable.platformServiceFeatureId,
                platformServiceFeatureId,
              ),
              eq(
                userCommissionSettingTable.platformServiceId,
                platformServiceId,
              ),
            ),
            eq(userCommissionSettingTable.isActive, true),
          ),
        )
        .limit(1);

      console.log('User Rule:', userRule);

      if (userRule) return userRule;

      // 2️⃣ ROLE LEVEL CHECK
      const [roleRule] = await db
        .select()
        .from(roleCommissionSettingTable)
        .where(
          and(
            eq(roleCommissionSettingTable.tenantId, tenantId),
            eq(roleCommissionSettingTable.roleId, roleId),
            or(
              eq(
                roleCommissionSettingTable.platformServiceFeatureId, // ✅ FIXED
                platformServiceFeatureId,
              ),
              eq(
                roleCommissionSettingTable.platformServiceId, // ✅ FIXED
                platformServiceId,
              ),
            ),
            eq(roleCommissionSettingTable.isActive, true),
          ),
        )
        .limit(1);

      console.log('Role Rule:', roleRule);

      if (roleRule) return roleRule;

      throw ApiError.notFound('Commission rule not configured');
    } catch (err) {
      console.log(err);
    }
  }
}

export default CommissionSettingService;
