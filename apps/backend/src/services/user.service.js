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
import { eq, and, or, desc } from 'drizzle-orm';

class UserService {
  async create(data, actor) {
    console.log(actor);

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

    const [role] = await db
      .select()
      .from(roleTable)
      .where(eq(roleTable.id, data.roleId))
      .limit(1);

    if (!role) {
      throw ApiError.badRequest('Invalid role ID');
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
    let builder = db
      .select()
      .from(usersTable)
      .where(eq(usersTable.tenantId, actor.tenantId));

    if (query.status) {
      builder = builder.and(eq(usersTable.userStatus, query.status));
    }

    const page = query.page ? parseInt(query.page, 10) : 1;
    const limit = query.limit ? parseInt(query.limit, 10) : 20;
    const offset = (page - 1) * limit;

    builder = builder
      .limit(limit)
      .offset(offset)
      .orderBy(desc(usersTable.createdAt));

    const users = await builder; // <- just await the builder, no .all()
    return users;
  }

  async findOne(id, actor) {
    const user = await db
      .select()
      .from(usersTable)
      .where(
        and(
          usersTable.id.eq(id),
          usersTable.tenantId.eq(actor.tenantId), // tenant-safe query
        ),
      )
      .get();

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

  async getDirectChildren(userId, actor) {
    await this.findOne(userId, actor);

    const children = await db
      .select()
      .from(usersTable)
      .where(usersTable.parentId.eq(userId))
      .and(usersTable.deletedAt.isNull())
      .all();

    return children;
  }

  async getAllDescendants(userId, actor) {
    await this.findOne(userId, actor);

    const descendants = [];

    const fetchChildren = async (parentIds) => {
      if (!parentIds.length) return;

      const children = await db
        .select()
        .from(usersTable)
        .where(usersTable.parentId.in(parentIds))
        .and(usersTable.deletedAt.isNull())
        .all();

      if (children.length) {
        descendants.push(...children);
        await fetchChildren(children.map((c) => c.id));
      }
    };

    await fetchChildren([userId]);
    return descendants;
  }
}

export default new UserService();
