import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { eq, inArray, sql } from 'drizzle-orm';
import { randomUUID } from 'crypto';

import { CoreDbService } from '../db/core/drizzle';
import { roleTable } from '../db/core/schema';
import { CreateRoleDto } from './dtos/create-role.dto';
import { UpdateRoleDto } from './dtos/update-role.dto';

@Injectable()
export class RolesService {
  constructor(private readonly db: CoreDbService) {}

  async create(dto: CreateRoleDto) {
    const existing = await this.db
      .select({ id: roleTable.id })
      .from(roleTable)
      .where(eq(roleTable.roleCode, dto.roleCode))
      .limit(1);

    if (existing.length) {
      throw new ConflictException('Role code already exists');
    }

    const id = randomUUID();

    await this.db.insert(roleTable).values({
      id,
      roleCode: dto.roleCode,
      roleName: dto.roleName,
      roleDescription: dto.roleDescription ?? null,
    });

    return {
      id,
      message: 'Role created successfully',
    };
  }

  async findAll() {
    return this.db.select().from(roleTable).orderBy(roleTable.createdAt);
  }

  async findOne(id: string) {
    const roles = await this.db
      .select()
      .from(roleTable)
      .where(eq(roleTable.id, id))
      .limit(1);

    if (!roles.length) {
      throw new NotFoundException('Role not found');
    }

    return roles[0];
  }

  async findByRoleCode(roleCode: string) {
    const roles = await this.db
      .select()
      .from(roleTable)
      .where(eq(roleTable.roleCode, roleCode))
      .limit(1);

    if (!roles.length) {
      throw new NotFoundException('Role not found');
    }

    return roles[0];
  }

  async update(id: string, dto: UpdateRoleDto) {
    const existing = await this.findOne(id);
    if (!existing) {
      throw new Error('Role not found');
    }

    if (dto.roleCode && dto.roleCode !== existing.roleCode) {
      const conflict = await this.db
        .select({ id: roleTable.id })
        .from(roleTable)
        .where(eq(roleTable.roleCode, dto.roleCode))
        .limit(1);

      if (conflict.length) {
        throw new ConflictException('Role code already exists');
      }
    }

    await this.db
      .update(roleTable)
      .set({
        roleCode: dto.roleCode ?? existing.roleCode,
        roleName: dto.roleName ?? existing.roleName,
        roleDescription:
          dto.roleDescription !== undefined
            ? dto.roleDescription
            : existing.roleDescription,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where(eq(roleTable.id, id));

    return {
      message: 'Role updated successfully',
    };
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.db.delete(roleTable).where(eq(roleTable.id, id));

    return {
      message: 'Role deleted successfully',
    };
  }

  async bulkCreate(dtos: CreateRoleDto[]) {
    const roleCodes = dtos.map((r) => r.roleCode);
    const uniqueCodes = new Set(roleCodes);

    if (uniqueCodes.size !== roleCodes.length) {
      throw new ConflictException('Duplicate roleCode in request payload');
    }

    const existing = await this.db
      .select({ roleCode: roleTable.roleCode })
      .from(roleTable)
      .where(inArray(roleTable.roleCode, roleCodes));

    if (existing.length) {
      throw new ConflictException(
        `Role codes already exist: ${existing
          .map((r) => r.roleCode)
          .join(', ')}`,
      );
    }

    const values = dtos.map((dto) => ({
      id: randomUUID(),
      roleCode: dto.roleCode,
      roleName: dto.roleName,
      roleDescription: dto.roleDescription ?? null,
    }));

    await this.db.insert(roleTable).values(values);

    return {
      count: values.length,
      message: 'Roles created successfully',
    };
  }

  async bulkDelete(ids: string[]) {
    if (!ids.length) {
      return { count: 0 };
    }

    return this.db.transaction(async (tx) => {
      // Use a filter to ensure only defined IDs are used
      const firstId = ids[0];
      if (!firstId) {
        throw new Error('Invalid ID');
      }

      const existing = await tx
        .select({ id: roleTable.id })
        .from(roleTable)
        .where(eq(roleTable.id, firstId));

      if (!existing.length) {
        throw new NotFoundException('No roles found for deletion');
      }

      for (const id of ids) {
        if (!id) continue; // skip undefined just in case
        await tx.delete(roleTable).where(eq(roleTable.id, id));
      }

      return {
        count: ids.length,
        message: 'Roles deleted successfully',
      };
    });
  }
}
