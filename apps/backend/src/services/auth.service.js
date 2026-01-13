import { db } from '../database/core/core-db.js';
import {
  usersTable,
  employeesTable,
  roleTable,
  tenantsTable,
} from '../models/core/index.js';
import { and, eq } from 'drizzle-orm';
import { generateTokens, hashToken, verifyPassword } from '../lib/lib.js';
import { ApiError } from '../lib/ApiError.js';

class AuthService {
  async loginUser(data) {
    const [user] = await db
      .select({
        id: usersTable.id,
        passwordHash: usersTable.passwordHash,
        tenantId: usersTable.tenantId,
        userStatus: usersTable.userStatus,
        roleId: usersTable.roleId,
        isSystem: roleTable.isSystem,
        ownerUserId: usersTable.ownerUserId,
      })
      .from(usersTable)
      .leftJoin(roleTable, eq(usersTable.roleId, roleTable.id))
      .where(eq(usersTable.userNumber, data.identifier))
      .limit(1);

    if (!user) {
      throw ApiError.unauthorized('Invalid credentials');
    }

    if (user.userStatus !== 'ACTIVE') {
      throw ApiError.forbidden('User is inactive');
    }

    const valid = verifyPassword(data.password, user.passwordHash);
    if (!valid) {
      throw ApiError.unauthorized('Invalid credentials');
    }

    if (!user.isSystem) {
      await this.validateOwnerChain(user.id, user.ownerUserId, user.tenantId);
    }

    const [tenant] = await db
      .select({
        id: tenantsTable.id,
        userType: tenantsTable.userType,
      })
      .from(tenantsTable)
      .where(eq(tenantsTable.id, user.tenantId))
      .limit(1);

    if (!tenant) {
      throw ApiError.unauthorized('Tenant not found');
    }

    const tokens = generateTokens({
      sub: user.id,
      tenantId: tenant.id,
      tenantType: tenant.userType,
      type: 'USER',
      roleId: user.roleId,
    });

    await db
      .update(usersTable)
      .set({ refreshTokenHash: hashToken(tokens.refreshToken) })
      .where(eq(usersTable.id, user.id));

    return {
      id: user.id,
      tenantId: user.tenantId,
      roleId: user.roleId,
      type: 'USER',
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async loginEmployee(data) {
    const [employee] = await db
      .select()
      .from(employeesTable)
      .where(eq(employeesTable.employeeNumber, data.identifier))

      .limit(1);

    if (!employee) {
      throw ApiError.unauthorized('Invalid credentials');
    }

    if (employee.employeeStatus !== 'ACTIVE') {
      throw ApiError.forbidden('Employee inactive');
    }

    const valid = verifyPassword(data.password, employee.passwordHash);
    if (!valid) {
      throw ApiError.unauthorized('Invalid credentials');
    }

    const tokens = generateTokens({
      sub: employee.id,
      tenantId: employee.tenantId,
      type: 'EMPLOYEE',
      departmentId: employee.departmentId, // 🔑 IMPORTANT
    });

    await db
      .update(employeesTable)
      .set({ refreshTokenHash: hashToken(tokens.refreshToken) })
      .where(eq(employeesTable.id, employee.id));

    return {
      id: employee.id,
      tenantId: employee.tenantId,
      type: 'EMPLOYEE',
      departmentId: employee.departmentId,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async logout({ userId, type }) {
    const table = type === 'EMPLOYEE' ? employeesTable : usersTable;

    await db
      .update(table)
      .set({ refreshTokenHash: null })
      .where(eq(table.id, userId));
  }

  async getCurrentUser(actor) {
    const { id: userId, type, tenantId } = actor;

    if (type === 'EMPLOYEE') {
      const [employee] = await db
        .select({
          id: employeesTable.id,
          tenantId: employeesTable.tenantId,
          departmentId: employeesTable.departmentId,
          employeeStatus: employeesTable.employeeStatus,
        })
        .from(employeesTable)
        .where(eq(employeesTable.id, userId))
        .limit(1);

      if (!employee || employee.employeeStatus !== 'ACTIVE') {
        throw ApiError.unauthorized('Session expired');
      }

      return {
        id: employee.id,
        tenantId: employee.tenantId,
        type: 'EMPLOYEE',
        departmentId: employee.departmentId,
      };
    }

    // USER
    const [user] = await db
      .select({
        id: usersTable.id,
        tenantId: usersTable.tenantId,
        roleId: usersTable.roleId,
        isSystem: roleTable.isSystem,
        userStatus: usersTable.userStatus,
      })
      .from(usersTable)
      .leftJoin(roleTable, eq(usersTable.roleId, roleTable.id))
      .where(eq(usersTable.id, userId))
      .limit(1);

    if (!user || user.userStatus !== 'ACTIVE') {
      throw ApiError.unauthorized('Session expired');
    }

    return {
      id: user.id,
      tenantId: user.tenantId,
      type: 'USER',
      roleId: user.roleId,
      isSystem: user.isSystem,
    };
  }

  async validateOwnerChain(userId, ownerUserId, tenantId) {
    let currentOwner = ownerUserId;

    while (currentOwner) {
      const [owner] = await db
        .select({
          id: usersTable.id,
          ownerUserId: usersTable.ownerUserId,
          userStatus: usersTable.userStatus,
          isSystem: roleTable.isSystem,
        })
        .from(usersTable)
        .leftJoin(roleTable, eq(usersTable.roleId, roleTable.id))
        .where(
          and(
            eq(usersTable.id, currentOwner),
            eq(usersTable.tenantId, tenantId),
          ),
        )
        .limit(1);

      if (!owner) {
        throw ApiError.forbidden('Invalid ownership chain');
      }

      if (owner.userStatus !== 'ACTIVE') {
        throw ApiError.forbidden('Owner inactive');
      }

      if (owner.isSystem) {
        break;
      }

      if (!owner.ownerUserId) {
        break;
      }

      currentOwner = owner.ownerUserId;
    }
  }
}

export default new AuthService();
