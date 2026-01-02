import { db } from '../database/core/db.js';
import { roleTable, usersTable } from '../models/core/index.js';
import { ApiError } from '../utils/ApiError.js';
import { randomUUID } from 'crypto';
import { encrypt, generateNumber } from '../lib/lib.js';

class UserService {
  async create(data, actor) {
    const existingUser = await db
      .select()
      .from(usersTable)
      .where(
        usersTable.email
          .eq(data.email)
          .or(usersTable.mobileNumber.eq(data.mobileNumber))
          .and(usersTable.tenantId.eq(actor.tenantId)),
      )
      .get();

    if (existingUser) {
      throw ApiError.badRequest(
        'User with this email or mobile number already exists',
      );
    }

    const role = await db
      .select()
      .from(roleTable)
      .where(roleTable.id.eq(data.roleId))
      .get();

    if (!role) {
      throw ApiError.badRequest('Invalid role ID');
    }

    const generatedPassword = generatePassword();
    const generatedTransactionPin = generateTransactionPin();
    const passwordHash = encrypt(generatedPassword);
    const transactionPinHash = encrypt(generatedTransactionPin);

    const userPayload = {
      id: randomUUID(),
      userNumber: generateNumber('USR'),
      ...validatedData,
      passwordHash,
      transactionPinHash,
      tenantId: actor.tenantId,
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

    // Insert into database
    const [newUser] = await db
      .insert(usersTable)
      .values(userPayload)
      .returning();

    return newUser;
  }

  async findOne(id, actor) {
    const user = await db
      .select()
      .from(usersTable)
      .where(usersTable.id.eq(id))
      .get();

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    // Optional: enforce tenant check
    if (user.tenantId !== actor.tenantId) {
      throw ApiError.forbidden('Access denied');
    }

    return user;
  }

  async update(id, data, actor) {
    const validatedData = updateUserSchema.parse(data);

    const user = await this.findOne(id, actor);

    const updatedPayload = {
      ...validatedData,
      updatedAt: new Date(),
    };

    const [updatedUser] = await db
      .update(usersTable)
      .set(updatedPayload)
      .where(usersTable.id.eq(id))
      .returning();

    return updatedUser;
  }

  async remove(id, actor) {
    const user = await this.findOne(id, actor);

    const [deletedUser] = await db
      .update(usersTable)
      .set({
        deletedAt: new Date(),
        userStatus: 'DELETED',
        updatedAt: new Date(),
      })
      .where(usersTable.id.eq(id))
      .returning();

    return deletedUser;
  }

  async getDirectChildren(userId, actor) {
    const children = await db
      .select()
      .from(usersTable)
      .where(usersTable.parentId.eq(userId))
      .all();

    return children;
  }

  async getAllDescendants(userId, actor) {
    const descendants = [];

    const fetchChildren = async (parentIds) => {
      if (!parentIds.length) return;

      const children = await db
        .select()
        .from(usersTable)
        .where(usersTable.parentId.in(parentIds))
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
