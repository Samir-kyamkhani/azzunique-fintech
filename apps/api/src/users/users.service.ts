import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { and, eq, InferSelectModel, isNull, or } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';

import { CoreDbService } from '../db/core/drizzle';
import { usersTable } from '../db/core/schema';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';

type User = InferSelectModel<typeof usersTable>;

@Injectable()
export class UsersService {
  constructor(private readonly db: CoreDbService) {}

  async create(dto: CreateUserDto) {
    const {
      userNumber,
      firstName,
      lastName,
      email,
      mobileNumber,
      roleId,
      tenantId,
      parentId,
      createdByEmployeeId,
    } = dto;

    const existing = await this.db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(
        or(
          eq(usersTable.email, email),
          eq(usersTable.mobileNumber, mobileNumber),
          eq(usersTable.userNumber, userNumber),
        ),
      )
      .limit(1);

    if (existing.length) {
      throw new ConflictException(
        'User with email, mobile number, or user number already exists',
      );
    }

    if (parentId) {
      const [parent] = await this.db
        .select({ id: usersTable.id })
        .from(usersTable)
        .where(eq(usersTable.id, parentId))
        .limit(1);

      if (!parent) {
        throw new NotFoundException('Invalid parent user');
      }
    }

    const id = randomUUID();

    await this.db.insert(usersTable).values({
      id,
      userNumber,
      firstName,
      lastName,
      email,
      mobileNumber,
      passwordHash: dto.passwordHash,
      transactionPinHash: dto.transactionPinHash ?? null,
      roleId,
      tenantId,
      parentId: parentId ?? null,
      createdByEmployeeId: createdByEmployeeId ?? null,
    });

    return {
      id,
      message: 'User created successfully',
    };
  }

  async findAll(tenantId: string) {
    return this.db
      .select()
      .from(usersTable)
      .where(
        and(eq(usersTable.tenantId, tenantId), isNull(usersTable.deletedAt)),
      );
  }

  async findOne(id: string) {
    const users = await this.db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, id))
      .limit(1);

    if (!users.length) {
      throw new NotFoundException('User not found');
    }

    return users[0];
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.findOne(id);

    await this.db
      .update(usersTable)
      .set({
        ...dto,
        updatedAt: new Date(),
      })
      .where(eq(usersTable.id, id));

    return {
      message: 'User updated successfully',
    };
  }

  async remove(id: string) {
    await this.findOne(id);

    // ✅ Soft delete (industry standard)
    await this.db
      .update(usersTable)
      .set({
        deletedAt: new Date(),
      })
      .where(eq(usersTable.id, id));

    return {
      message: 'User deleted successfully',
    };
  }

  async getDirectChildren(parentId: string, tenantId: string) {
    return this.db
      .select()
      .from(usersTable)
      .where(
        and(
          eq(usersTable.parentId, parentId),
          eq(usersTable.tenantId, tenantId),
          isNull(usersTable.deletedAt),
        ),
      )
      .orderBy(usersTable.createdAt);
  }

  async getAllDescendants(
    rootUserId: string,
    tenantId: string,
  ): Promise<User[]> {
    const result: User[] = [];

    const fetch = async (parentId: string): Promise<void> => {
      const children = await this.db
        .select()
        .from(usersTable)
        .where(
          and(
            eq(usersTable.parentId, parentId),
            eq(usersTable.tenantId, tenantId),
            isNull(usersTable.deletedAt),
          ),
        );

      for (const child of children) {
        result.push(child);
        await fetch(child.id);
      }
    };

    await fetch(rootUserId);
    return result;
  }
}
