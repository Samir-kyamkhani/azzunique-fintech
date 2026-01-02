import { db } from '../database/core/core-db.js';
import { usersTable, employeesTable, roleTable } from '../models/core/index.js';
import { eq, and, or } from 'drizzle-orm';
import { encrypt, generateTokens, verifyPassword } from '../lib/lib.js';
import { ApiError } from '../lib/ApiError.js';

class AuthService {
  async loginUser(data) {
    const [user] = await db
      .select({
        id: usersTable.id,
        email: usersTable.email,
        mobileNumber: usersTable.mobileNumber,
        passwordHash: usersTable.passwordHash,
        tenantId: usersTable.tenantId,
        parentId: usersTable.parentId,
        userStatus: usersTable.userStatus,
        roleId: usersTable.roleId,
        roleCode: roleTable.code,
      })
      .from(usersTable)
      .leftJoin(roleTable, eq(usersTable.roleId, roleTable.id))
      .where(
        or(
          eq(usersTable.email, data.identifier),
          eq(usersTable.mobileNumber, data.identifier),
        ),
      )
      .limit(1);

    if (!user) {
      throw ApiError.unauthorized('Invalid credentials');
    }

    if (user.userStatus !== 'ACTIVE') {
      throw ApiError.forbidden('User is inactive');
    }

    if (user.roleCode !== 'AZZUNIQUE') {
      await this.validateHierarchy(user.id, user.parentId, user.tenantId);
    }

    const isValid = verifyPassword(data.password, user.passwordHash);
    if (!isValid) {
      throw ApiError.unauthorized('Invalid credentials');
    }

    const tokens = generateTokens({
      sub: user.id,
      tenantId: user.tenantId,
      type: 'USER',
      roleId: user.roleId,
    });

    await db
      .update(usersTable)
      .set({ refreshTokenHash: await encrypt(tokens.refreshToken) })
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
      .where(
        or(
          eq(employeesTable.email, data.identifier),
          eq(employeesTable.mobileNumber, data.identifier),
        ),
      )
      .limit(1);

    if (!employee) {
      throw ApiError.unauthorized('Invalid credentials');
    }

    if (employee.employeeStatus !== 'ACTIVE') {
      throw ApiError.forbidden('Employee inactive');
    }

    const valid = verifyPassword(password, employee.passwordHash);
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
      .set({ refreshTokenHash: await encrypt(tokens.refreshToken) })
      .where(eq(employeesTable.id, employee.id));

    return { employee, ...tokens };
  }

  async logout({ userId, type }) {
    const table = type === 'EMPLOYEE' ? employeesTable : usersTable;

    await db
      .update(table)
      .set({ refreshTokenHash: null })
      .where(eq(table.id, userId));
  }

  async validateHierarchy(userId, parentId, tenantId) {
    let currentParent = parentId;

    while (currentParent) {
      const [parent] = await db
        .select()
        .from(usersTable)
        .where(
          and(
            eq(usersTable.id, currentParent),
            eq(usersTable.tenantId, tenantId),
          ),
        )
        .limit(1);

      if (!parent) {
        throw ApiError.forbidden('Invalid hierarchy');
      }

      if (parent.userStatus !== 'ACTIVE') {
        throw ApiError.forbidden('Parent inactive');
      }

      currentParent = parent.parentId;
    }
  }
}

export default new AuthService();
