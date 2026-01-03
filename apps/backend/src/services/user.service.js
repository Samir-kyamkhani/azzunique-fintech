import { roleTable, tenantsTable, usersTable } from '../models/core/index.js';
import { randomUUID } from 'crypto';
import {
  encrypt,
  generateNumber,
  generatePassword,
  generateTransactionPin,
} from '../lib/lib.js';
import { db } from '../database/core/core-db.js';
import { ApiError } from '../lib/ApiError.js';
import { eq, and, or, desc, isNull, like, inArray } from 'drizzle-orm';

class UserService {
  async create(data, actor) {
    const [role] = await db
      .select()
      .from(roleTable)
      .where(eq(roleTable.id, data.roleId))
      .limit(1);

    if (!role) {
      throw ApiError.badRequest('Invalid role ID');
    }
    console.log(role.roleCode);

    if (role.roleCode === 'AZZUNIQUE') {
      const [existingAzzUnique] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.roleId, role.id))
        .limit(1);

      if (existingAzzUnique) {
        throw ApiError.badRequest(
          'AZZUNIQUE user already exists in the system',
        );
      }
    }

    const [existingUser] = await db
      .select()
      .from(usersTable)
      .where(
        and(
          or(
            eq(usersTable.email, data.email),
            eq(usersTable.mobileNumber, data.mobileNumber),
          ),
          eq(usersTable.tenantId, data.tenantId),
        ),
      )
      .limit(1);

    if (existingUser) {
      throw ApiError.badRequest(
        'User with this email or mobile number already exists',
      );
    }

    const [tenant] = await db
      .select()
      .from(tenantsTable)
      .where(eq(tenantsTable.id, data.tenantId))
      .limit(1);

    if (!tenant) {
      throw ApiError.badRequest('Invalid tenant ID');
    }

    const generatedPassword = generatePassword();

    const generatedTransactionPin = generateTransactionPin();
    const passwordHash = encrypt(generatedPassword);
    const transactionPinHash = encrypt(generatedTransactionPin);

    const userPayload = {
      id: randomUUID(),
      userNumber: generateNumber('USR'),
      ...data,
      passwordHash,
      transactionPinHash,
      parentId: actor.type === 'USER' ? actor.id : null,
      createdByEmployeeId: actor.type === 'EMPLOYEE' ? actor.id : null,
      userStatus: 'INACTIVE',
      actionReason:
        'Kindly contact the administrator to have your account activated.',
      isKycVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Create wallet for state_head, master_distributer, distributer, reatiler user

    // Send credentials email

    await db.insert(usersTable).values(userPayload);

    const [newUser] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userPayload.id))
      .limit(1);

    return newUser;
  }

  async findAll(query = {}, actor) {
    const page = query.page ? parseInt(query.page, 10) : 1;
    const limit = query.limit ? parseInt(query.limit, 10) : 20;
    const offset = (page - 1) * limit;

    const conditions = [
      eq(tenantsTable.parentTenantId, actor.tenantId),
      eq(usersTable.parentId, actor.id),
    ];

    if (query.status) {
      conditions.push(eq(usersTable.userStatus, query.status));
    }

    if (query.search) {
      const searchTerm = `%${query.search}%`;

      conditions.push(
        or(
          like(usersTable.email, searchTerm),
          like(usersTable.mobileNumber, searchTerm),
          like(usersTable.userNumber, searchTerm),
          like(tenantsTable.tenantNumber, searchTerm),
        ),
      );
    }

    // Fetch users with tenant info
    const rows = await db
      .select()
      .from(usersTable)
      .leftJoin(tenantsTable, eq(usersTable.tenantId, tenantsTable.id))
      .where(and(...conditions))
      .orderBy(desc(usersTable.createdAt))
      .limit(limit)
      .offset(offset);

    // Group users by tenant
    const tenantMap = {};

    rows.forEach((row) => {
      const tenantId = row.tenants.id;

      if (!tenantMap[tenantId]) {
        tenantMap[tenantId] = {
          tenant: row.tenants,
          users: [],
        };
      }

      tenantMap[tenantId].users.push(row.users);
    });

    return Object.values(tenantMap);
  }

  async findOne(id, actor) {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(
        and(eq(usersTable.id, id), eq(usersTable.tenantId, actor.tenantId)),
      )
      .limit(1);

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    return user;
  }

  async update(id, data, actor) {
    await this.findOne(id, actor);

    const updatedPayload = {
      ...data,
      deletedAt: data.userStatus === 'DELETED' && new Date(),
      updatedAt: new Date(),
    };

    const [updatedUser] = await db
      .update(usersTable)
      .set(updatedPayload)
      .where(usersTable.id.eq(id))
      .returning();

    return updatedUser;
  }

  async getAllDescendants(userId, actor, query = {}) {
    await this.findOne(userId, actor);

    const page = query.page ? parseInt(query.page, 10) : 1;
    const limit = query.limit ? parseInt(query.limit, 10) : 20;
    const offset = (page - 1) * limit;

    const descendants = [];

    const fetchChildren = async (parentIds) => {
      if (!parentIds.length) return;

      const conditions = [
        inArray(usersTable.parentId, parentIds),
        isNull(usersTable.deletedAt),
      ];

      const children = await db
        .select()
        .from(usersTable)
        .where(and(...conditions))
        .orderBy(desc(usersTable.createdAt));

      if (children.length) {
        descendants.push(...children);
        // Recurse to next level
        await fetchChildren(children.map((c) => c.id));
      }
    };

    await fetchChildren([userId]);

    const paginated = descendants.slice(offset, offset + limit);

    return {
      total: descendants.length,
      page,
      limit,
      data: paginated,
    };
  }
}

export default new UserService();
