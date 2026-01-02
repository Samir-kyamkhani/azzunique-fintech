import { db } from '../database/core/core-db.js';
import { usersTable, employeesTable } from '../models/core/index.js';
import { eq, and, or } from 'drizzle-orm';
import { ApiError } from '../utils/ApiError.js';
import { encrypt, generateTokens } from '../lib/lib.js';

class AuthService {
  async loginUser({ identifier, password, tenantId }) {
    if (!identifier || !password || !tenantId) {
      throw ApiError.badRequest('Missing credentials');
    }

    const [user] = await db
      .select()
      .from(usersTable)
      .where(
        and(
          eq(usersTable.tenantId, tenantId),
          or(
            eq(usersTable.email, identifier),
            eq(usersTable.mobileNumber, identifier),
          ),
        ),
      )
      .limit(1);

    if (!user) {
      throw ApiError.unauthorized('Invalid credentials');
    }

    if (user.userStatus !== 'ACTIVE') {
      throw ApiError.forbidden('User is inactive');
    }

    await this.validateHierarchy(user.id, user.parentId, tenantId);

    const isValid = verifyPassword(password, user.passwordHash);
    if (!isValid) {
      throw ApiError.unauthorized('Invalid credentials');
    }

    const tokens = generateTokens({
      sub: user.id,
      tenantId: user.tenantId,
      type: 'USER',
      roleId: user.roleId, // 🔑 IMPORTANT
    });

    await db
      .update(usersTable)
      .set({ refreshTokenHash: await encrypt(tokens.refreshToken) })
      .where(eq(usersTable.id, user.id));

    return { user, ...tokens };
  }

  async loginEmployee({ identifier, password, tenantId }) {
    const [employee] = await db
      .select()
      .from(employeesTable)
      .where(
        and(
          eq(employeesTable.tenantId, tenantId),
          or(
            eq(employeesTable.email, identifier),
            eq(employeesTable.mobileNumber, identifier),
          ),
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
      tenantId: tenantId,
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
