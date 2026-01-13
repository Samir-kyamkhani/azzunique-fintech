import {
  permissionTable,
  rolePermissionTable,
  roleHierarchyTable,
  roleTable,
  tenantsTable,
  userPermissionTable,
  usersTable,
} from '../models/core/index.js';
import { randomUUID } from 'node:crypto';
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
import { resolvePermissions } from './permission.resolver.js';

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

    const [actorRole] = await db
      .select({ isSystem: roleTable.isSystem })
      .from(roleTable)
      .where(eq(roleTable.id, actor.roleId))
      .limit(1);

    if (!actorRole) {
      throw ApiError.forbidden('Invalid actor role');
    }

    if (role.isSystem && !actorRole.isSystem) {
      throw ApiError.forbidden(
        'Only system users can create system-level users',
      );
    }

    if (!actorRole.isSystem) {
      const allowedRoles = await db
        .select({ childRoleId: roleHierarchyTable.childRoleId })
        .from(roleHierarchyTable)
        .where(
          and(
            eq(roleHierarchyTable.parentRoleId, actor.roleId),
            eq(roleHierarchyTable.tenantId, actor.tenantId),
          ),
        );

      if (!allowedRoles.some((r) => r.childRoleId === data.roleId)) {
        throw ApiError.forbidden('You cannot create a user with this role');
      }
    }

    const [tenant] = await db
      .select({ id: tenantsTable.id })
      .from(tenantsTable)
      .where(eq(tenantsTable.id, data.tenantId))
      .limit(1);

    if (!tenant) {
      throw ApiError.badRequest('Invalid tenant');
    }

    const [existingOwner] = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(
        and(
          eq(usersTable.tenantId, data.tenantId),
          isNull(usersTable.ownerUserId), // owner user
        ),
      )
      .limit(1);

    const isCreatingFirstOwner = !existingOwner;

    const isSameTenant = actor.ownedTenantId === data.tenantId;

    // Parent tenant creating first owner of child tenant
    const isParentCreatingFirstOwner =
      actor.isTenantOwner && !isSameTenant && isCreatingFirstOwner;

    if (!isSameTenant && !isParentCreatingFirstOwner) {
      throw ApiError.forbidden('You can create users only for your own tenant');
    }

    const [exists] = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(
        and(
          eq(usersTable.tenantId, data.tenantId),
          or(
            eq(usersTable.email, data.email),
            eq(usersTable.mobileNumber, data.mobileNumber),
          ),
        ),
      )
      .limit(1);

    if (exists) {
      throw ApiError.conflict('User already exists in this tenant');
    }

    const ownerUserId = isCreatingFirstOwner ? null : actor.id;

    const password = generatePassword();
    const pin = generateTransactionPin();
    const userId = randomUUID();

    const payload = {
      id: userId,
      userNumber: generateNumber('USR'),

      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      mobileNumber: data.mobileNumber,

      tenantId: data.tenantId,
      roleId: data.roleId,

      passwordHash: encrypt(password),
      transactionPinHash: encrypt(pin),

      ownerUserId,

      createdByUserId: actor.type === 'USER' ? actor.id : null,
      createdByEmployeeId: actor.type === 'EMPLOYEE' ? actor.id : null,

      userStatus: 'INACTIVE',
      isKycVerified: false,
      actionReason: 'Kindly contact the administrator to activate your account',

      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Create wallet for state_head, master_distributer, distributer, reatiler user

    // 7️⃣ Send credentials
    const sent = eventBus.emit(EVENTS.USER_CREATED, {
      userId,
      userNumber: payload.userNumber,
      password,
      transactionPin: pin,
      tenantId: data.tenantId,
    });

    if (!sent) {
      throw ApiError.internal('Failed to send credentials');
    }

    await db.insert(usersTable).values(payload);

    return this.findOne(userId, actor);
  }

  async findAll(query = {}, actor) {
    const page = query.page ? parseInt(query.page, 10) : 1;
    const limit = query.limit ? parseInt(query.limit, 10) : 20;
    const offset = (page - 1) * limit;

    const conditions = [eq(usersTable.tenantId, actor.tenantId)];

    if (!actor.isTenantOwner) {
      conditions.push(eq(usersTable.ownerUserId, actor.id));
    }

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
      .select({
        users: usersTable,
        tenants: tenantsTable,
      })
      .from(usersTable)
      .leftJoin(tenantsTable, eq(usersTable.tenantId, tenantsTable.id))
      .where(and(...conditions))
      .orderBy(desc(usersTable.createdAt))
      .limit(limit)
      .offset(offset);

    const userIds = rows.map((r) => r.users.id);
    const roleIds = [...new Set(rows.map((r) => r.users.roleId))];

    const rolePermissions = await db
      .select({
        roleId: rolePermissionTable.roleId,
        permissionId: permissionTable.id,
        resource: permissionTable.resource,
        action: permissionTable.action,
      })
      .from(rolePermissionTable)
      .leftJoin(
        permissionTable,
        eq(permissionTable.id, rolePermissionTable.permissionId),
      )
      .where(inArray(rolePermissionTable.roleId, roleIds));

    const userPermissions = await db
      .select({
        userId: userPermissionTable.userId,
        permissionId: permissionTable.id,
        resource: permissionTable.resource,
        action: permissionTable.action,
        effect: userPermissionTable.effect,
      })
      .from(userPermissionTable)
      .leftJoin(
        permissionTable,
        eq(permissionTable.id, userPermissionTable.permissionId),
      )
      .where(inArray(userPermissionTable.userId, userIds));

    const rolePermMap = new Map();
    rolePermissions.forEach((p) => {
      if (!rolePermMap.has(p.roleId)) rolePermMap.set(p.roleId, []);
      rolePermMap.get(p.roleId).push({
        id: p.permissionId,
        resource: p.resource,
        action: p.action,
        source: 'ROLE',
      });
    });

    const userPermMap = new Map();
    userPermissions.forEach((p) => {
      if (!userPermMap.has(p.userId)) userPermMap.set(p.userId, []);
      userPermMap.get(p.userId).push({
        id: p.permissionId,
        resource: p.resource,
        action: p.action,
        effect: p.effect,
        source: 'USER',
      });
    });

    const tenantMap = {};

    rows.forEach(({ users, tenants }) => {
      if (!tenantMap[tenants.id]) {
        tenantMap[tenants.id] = {
          tenant: tenants,
          users: [],
        };
      }

      tenantMap[tenants.id].users.push({
        ...users,
        profilePictureUrl: users.profilePicture
          ? s3Service.buildS3Url(users.profilePicture)
          : null,
        permissions: [
          ...(rolePermMap.get(users.roleId) || []),
          ...(userPermMap.get(users.id) || []),
        ],
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
    const [row] = await db
      .select({
        users: usersTable,
        tenants: tenantsTable,
      })
      .from(usersTable)
      .leftJoin(tenantsTable, eq(usersTable.tenantId, tenantsTable.id))
      .where(eq(usersTable.id, id))
      .limit(1);

    if (!row) {
      throw ApiError.notFound('User not found');
    }

    const user = row.users;

    // 🔐 OWNERSHIP CHECK
    if (user.tenantId !== actor.tenantId) {
      throw ApiError.forbidden('Cross-tenant access denied');
    }

    if (!actor.isTenantOwner && user.ownerUserId !== actor.id) {
      throw ApiError.forbidden('You can access only your own users');
    }

    // 🔑 Role permissions
    const rolePermissions = await db
      .select({
        permissionId: permissionTable.id,
        resource: permissionTable.resource,
        action: permissionTable.action,
      })
      .from(rolePermissionTable)
      .leftJoin(
        permissionTable,
        eq(permissionTable.id, rolePermissionTable.permissionId),
      )
      .where(eq(rolePermissionTable.roleId, user.roleId));

    // 🔑 User overrides
    const userPermissions = await db
      .select({
        permissionId: permissionTable.id,
        resource: permissionTable.resource,
        action: permissionTable.action,
        effect: userPermissionTable.effect,
      })
      .from(userPermissionTable)
      .leftJoin(
        permissionTable,
        eq(permissionTable.id, userPermissionTable.permissionId),
      )
      .where(eq(userPermissionTable.userId, user.id));

    return {
      ...user,
      profilePictureUrl: user.profilePicture
        ? s3Service.buildS3Url(user.profilePicture)
        : null,
      permissions: [
        ...rolePermissions.map((p) => ({
          id: p.permissionId,
          resource: p.resource,
          action: p.action,
          source: 'ROLE',
        })),
        ...userPermissions.map((p) => ({
          id: p.permissionId,
          resource: p.resource,
          action: p.action,
          effect: p.effect,
          source: 'USER',
        })),
      ],
    };
  }

  async update(id, data, actor, file) {
    const existingUser = await this.findOne(id, actor);

    // 🔐 Ownership already validated by findOne

    // EMAIL DUPLICATE
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

    // MOBILE DUPLICATE
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

    // ROLE CHANGE VALIDATION
    if (data.roleId && data.roleId !== existingUser.roleId) {
      const [role] = await db
        .select()
        .from(roleTable)
        .where(eq(roleTable.id, data.roleId))
        .limit(1);

      if (!role) throw ApiError.badRequest('Invalid role ID');
      if (role.isSystem && !actor.isTenantOwner) {
        throw ApiError.forbidden('System role assignment not allowed');
      }
    }

    const payload = { updatedAt: new Date() };

    if (data.firstName !== undefined) payload.firstName = data.firstName;
    if (data.lastName !== undefined) payload.lastName = data.lastName;
    if (data.email !== undefined) payload.email = data.email;
    if (data.mobileNumber !== undefined)
      payload.mobileNumber = data.mobileNumber;
    if (data.roleId !== undefined) payload.roleId = data.roleId;
    if (data.userStatus !== undefined) payload.userStatus = data.userStatus;

    // 📸 Profile image
    if (file) {
      const uploaded = await s3Service.upload(file.path, 'user-profile');

      if (existingUser.profilePicture) {
        await s3Service.deleteByKey(existingUser.profilePicture);
      }

      payload.profilePicture = uploaded.key;
    }

    // 🔔 Status change event
    if (data.userStatus && data.userStatus !== existingUser.userStatus) {
      eventBus.emit(EVENTS.USER_STATUS_CHANGED, {
        tenantId: actor.tenantId,
        userId: id,
        oldStatus: existingUser.userStatus,
        newStatus: data.userStatus,
        actionReason: data.actionReason || null,
      });
    }

    await db.update(usersTable).set(payload).where(eq(usersTable.id, id));

    return this.findOne(id, actor);
  }

  async getAllDescendants(userId, actor, query = {}) {
    // 1️⃣ Fetch root user (with ownership enforcement)
    const rootUser = await this.findOne(userId, actor);
    // findOne already ensures:
    // - same tenant
    // - tenant owner OR direct ownership

    // 2️⃣ Pagination
    const page = query.page ? parseInt(query.page, 10) : 1;
    const limit = query.limit ? parseInt(query.limit, 10) : 20;
    const offset = (page - 1) * limit;

    // 3️⃣ Recursive fetch (STRICT tenant + ownership)
    const fetchChildrenTree = async (ownerId) => {
      const children = await db
        .select()
        .from(usersTable)
        .where(
          and(
            eq(usersTable.ownerUserId, ownerId),
            eq(usersTable.tenantId, actor.tenantId),
            isNull(usersTable.deletedAt),
          ),
        )
        .orderBy(desc(usersTable.createdAt));

      if (!children.length) return [];

      return Promise.all(
        children.map(async (child) => ({
          ...child,
          profilePictureUrl: child.profilePicture
            ? s3Service.buildS3Url(child.profilePicture)
            : null,
          children: await fetchChildrenTree(child.id),
        })),
      );
    };

    // 4️⃣ Build tree
    const descendantsTree = await fetchChildrenTree(rootUser.id);

    // 5️⃣ Pagination only on first level children
    const paginatedChildren = descendantsTree.slice(offset, offset + limit);

    return {
      total: descendantsTree.length,
      page,
      limit,
      data: {
        ...rootUser,
        children: paginatedChildren,
      },
    };
  }

  async assignPermissions(userId, permissions, actor) {
    const [targetUser] = await db
      .select({
        id: usersTable.id,
        tenantId: usersTable.tenantId,
        ownerUserId: usersTable.ownerUserId,
      })
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    if (!targetUser) {
      throw ApiError.notFound('User not found');
    }

    if (targetUser.tenantId !== actor.tenantId) {
      throw ApiError.forbidden('Cross-tenant permission assignment denied');
    }

    if (!actor.isTenantOwner && targetUser.ownerUserId !== actor.id) {
      throw ApiError.forbidden(
        'You can assign permissions only to your own users',
      );
    }

    if (actor.id === userId) {
      throw ApiError.forbidden('You cannot modify your own permissions');
    }

    const permissionIds = permissions.map((p) => p.permissionId);

    const existing = await db
      .select({ id: permissionTable.id })
      .from(permissionTable)
      .where(inArray(permissionTable.id, permissionIds));

    if (existing.length !== permissionIds.length) {
      throw ApiError.badRequest('Invalid permission IDs');
    }

    const actorPermissions = await resolvePermissions(actor);

    if (!actorPermissions.includes('*')) {
      const forbidden = permissionIds.filter(
        (pid) => !actorPermissions.includes(pid),
      );
      if (forbidden.length) {
        throw ApiError.forbidden(
          'You cannot assign permissions you do not have',
        );
      }
    }

    await db
      .delete(userPermissionTable)
      .where(eq(userPermissionTable.userId, userId));

    await db.insert(userPermissionTable).values(
      permissions.map((p) => ({
        id: randomUUID(),
        userId,
        permissionId: p.permissionId,
        effect: p.effect,
      })),
    );
  }
}

export default new UserService();
