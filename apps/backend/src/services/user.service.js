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
import { eq, and, or, desc, isNull, like, inArray, ne, sql } from 'drizzle-orm';
import { eventBus } from '../events/events.js';
import { EVENTS } from '../events/events.constants.js';
import s3Service from '../lib/S3Service.js';

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
    const sentMail = eventBus.emit(EVENTS.USER_CREATED, {
      userId: userPayload.id,
      userNumber: userPayload.userNumber,
      transactionPin: generatedTransactionPin,
      password: generatedPassword,
      tenantId: actor.tenantId,
    });

    if (sentMail) {
      await db.insert(usersTable).values(userPayload);
    } else {
      throw ApiError.internal('Failed to send user credentials.');
    }

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

    const [{ count }] = await db
      .select({ count: sql`COUNT(*)`.mapWith(Number) })
      .from(usersTable)
      .leftJoin(tenantsTable, eq(usersTable.tenantId, tenantsTable.id))
      .where(and(...conditions));

    const statsRows = await db
      .select({
        status: usersTable.userStatus,
        count: sql`COUNT(*)`.mapWith(Number),
      })
      .from(usersTable)
      .leftJoin(tenantsTable, eq(usersTable.tenantId, tenantsTable.id))
      .where(and(...conditions))
      .groupBy(usersTable.userStatus);

    const stats = {
      ACTIVE: 0,
      INACTIVE: 0,
      SUSPENDED: 0,
      DELETED: 0,
    };

    statsRows.forEach((row) => {
      stats[row.status] = row.count;
    });

    const rows = await db
      .select()
      .from(usersTable)
      .leftJoin(tenantsTable, eq(usersTable.tenantId, tenantsTable.id))
      .where(and(...conditions))
      .orderBy(desc(usersTable.createdAt))
      .limit(limit)
      .offset(offset);

    const tenantMap = {};

    rows.forEach((row) => {
      const tenantId = row.tenants.id;
      const user = row.users;

      if (!tenantMap[tenantId]) {
        tenantMap[tenantId] = {
          tenant: row.tenants,
          users: [],
        };
      }

      tenantMap[tenantId].users.push({
        ...user,
        profilePictureUrl: user.profilePicture
          ? s3Service.buildS3Url(user.profilePicture)
          : null,
      });
    });

    return {
      data: Object.values(tenantMap),
      meta: {
        total: count,
        page,
        limit,
        stats,
      },
    };
  }

  async findOne(id, actor) {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(and(eq(usersTable.id, id)))
      .limit(1);

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    return {
      ...user,
      profilePictureUrl: user.profilePicture
        ? s3Service.buildS3Url(user.profilePicture)
        : null,
    };
  }

  async update(id, data, actor, file) {
    const existingUser = await this.findOne(id, actor);

    // EMAIL DUPLICATE CHECK
    if (data.email && data.email !== existingUser.email) {
      const [emailExists] = await db
        .select({ id: usersTable.id })
        .from(usersTable)
        .where(
          and(
            eq(usersTable.email, data.email),
            eq(usersTable.tenantId, existingUser.tenantId),
            ne(usersTable.id, id),
          ),
        )
        .limit(1);

      if (emailExists) {
        throw ApiError.badRequest('Email already exists');
      }
    }

    // MOBILE DUPLICATE CHECK
    if (data.mobileNumber && data.mobileNumber !== existingUser.mobileNumber) {
      const [mobileExists] = await db
        .select({ id: usersTable.id })
        .from(usersTable)
        .where(
          and(
            eq(usersTable.mobileNumber, data.mobileNumber),
            eq(usersTable.tenantId, existingUser.tenantId),
            ne(usersTable.id, id),
          ),
        )
        .limit(1);

      if (mobileExists) {
        throw ApiError.badRequest('Mobile number already exists');
      }
    }

    // ROLE VALIDATION
    if (data.roleId && data.roleId !== existingUser.roleId) {
      const [role] = await db
        .select()
        .from(roleTable)
        .where(eq(roleTable.id, data.roleId))
        .limit(1);

      if (!role) {
        throw ApiError.badRequest('Invalid role ID');
      }

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
    }

    const updatedPayload = {
      updatedAt: new Date(),
    };

    if (data.firstName !== undefined) updatedPayload.firstName = data.firstName;
    if (data.lastName !== undefined) updatedPayload.lastName = data.lastName;
    if (data.email !== undefined) updatedPayload.email = data.email;
    if (data.userStatus !== undefined)
      updatedPayload.userStatus = data.userStatus;
    if (data.mobileNumber !== undefined)
      updatedPayload.mobileNumber = data.mobileNumber;
    if (data.roleId !== undefined) updatedPayload.roleId = data.roleId;

    if (file) {
      const uploaded = await s3Service.upload(file.path, 'user-profile');

      if (existingUser.profilePicture) {
        await s3Service.deleteByKey(existingUser.profilePicture);
      }

      updatedPayload.profilePicture = uploaded.key;
    }

    if (data.userStatus && data.userStatus !== existingUser.userStatus) {
      eventBus.emit(EVENTS.USER_STATUS_CHANGED, {
        tenantId: actor.tenantId,
        userId: id,
        email: existingUser.email,
        oldStatus: existingUser.userStatus,
        newStatus: data.userStatus,
        actionReason: data.actionReason || null,
      });
    }

    await db
      .update(usersTable)
      .set(updatedPayload)
      .where(eq(usersTable.id, id));

    return await this.findOne(id, actor);
  }

  async getAllDescendants(userId, actor, query = {}) {
    const rootUser = await this.findOne(userId, actor);

    const page = query.page ? parseInt(query.page, 10) : 1;
    const limit = query.limit ? parseInt(query.limit, 10) : 20;
    const offset = (page - 1) * limit;

    const fetchChildrenTree = async (parentId) => {
      const conditions = [
        inArray(usersTable.parentId, [parentId]),
        isNull(usersTable.deletedAt),
      ];

      const children = await db
        .select()
        .from(usersTable)
        .where(and(...conditions))
        .orderBy(desc(usersTable.createdAt));

      if (!children.length) return [];

      const childrenWithSub = await Promise.all(
        children.map(async (child) => ({
          ...child,
          children: await fetchChildrenTree(child.id),
        })),
      );

      return childrenWithSub;
    };

    const descendantsTree = await fetchChildrenTree(userId);

    const fullTree = {
      ...rootUser,
      children: descendantsTree,
    };

    const paginatedChildren = fullTree.children.slice(offset, offset + limit);

    return {
      total: descendantsTree.length,
      page,
      limit,
      data: {
        ...fullTree,
        children: paginatedChildren,
      },
    };
  }
}

export default new UserService();
