import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, eq, sql } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';

import { CoreDbService } from 'src/db/core/drizzle';
import { departmentTable } from 'src/db/core/schema';
import { AuditlogService } from 'src/auditlog/auditlog.service';

import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { GetDepartmentsDto } from './dto/get-departments.dto';

@Injectable()
export class DepartmentsService {
  constructor(
    private readonly db: CoreDbService,
    private readonly audit: AuditlogService,
  ) {}

  // ==============================
  // GET ALL (PAGINATED)
  // ==============================
  async getAll(query: GetDepartmentsDto, actor: { tenantId: string }) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);
    const offset = (page - 1) * limit;

    const conditions = [eq(departmentTable.tenantId, actor.tenantId)];

    if (query.search) {
      conditions.push(
        sql`${departmentTable.departmentName} LIKE ${`%${query.search}%`}`,
      );
    }

    const data = await this.db
      .select()
      .from(departmentTable)
      .where(and(...conditions))
      .orderBy(sql`${departmentTable.createdAt} DESC`)
      .limit(limit)
      .offset(offset);

    const [result = { count: 0 }] = await this.db
      .select({ count: sql<number>`COUNT(*)` })
      .from(departmentTable)
      .where(and(...conditions));

    const count = result.count;

    return {
      data,
      pagination: {
        page,
        limit,
        total: Number(count),
        totalPages: Math.ceil(Number(count) / limit),
      },
    };
  }

  // ==============================
  // CREATE
  // ==============================
  async create(
    dto: CreateDepartmentDto,
    actor: {
      tenantId: string;
      userId?: string;
      employeeId?: string;
      role?: string;
      department?: string;
    },
    req: { ipAddress?: string; userAgent?: string },
  ) {
    const departmentId = randomUUID();

    try {
      await this.db.insert(departmentTable).values({
        id: departmentId,
        tenantId: actor.tenantId,
        departmentCode: dto.departmentCode,
        departmentName: dto.departmentName,
        departmentDescription: dto.departmentDescription ?? null,
        createdByUserId: actor.userId ?? null,
        createdByEmployeeId: actor.employeeId ?? null,
      });
    } catch (err: any) {
      if ((err as { code?: string }).code === 'ER_DUP_ENTRY') {
        throw new BadRequestException(
          'Department code already exists for this tenant',
        );
      }

      throw err; // rethrow other errors
    }

    // 🧾 AUDIT LOG
    await this.audit.create({
      entityType: 'DEPARTMENT',
      entityId: departmentId,
      action: 'CREATE',
      oldData: undefined,
      newData: dto,
      performByUserId: actor.userId! ?? null,
      performByEmployeeId: actor.employeeId! ?? null,
      ipAddress: req.ipAddress,
      userAgent: req.userAgent,
      tenantId: actor.tenantId,
      metaData: {
        role: actor.role,
        department: actor.department,
      },
    });

    return { id: departmentId };
  }

  // ==============================
  // UPDATE
  // ==============================
  async update(
    departmentId: string,
    dto: UpdateDepartmentDto,
    actor: {
      tenantId: string;
      userId?: string;
      employeeId?: string;
      role?: string;
      department?: string;
    },
    req: { ipAddress?: string; userAgent?: string },
  ) {
    const existing = await this.findByIdOrThrow(departmentId, actor.tenantId);

    await this.db
      .update(departmentTable)
      .set({
        ...dto,
        updatedAt: new Date(),
      })
      .where(eq(departmentTable.id, departmentId));

    // 🧾 AUDIT LOG
    await this.audit.create({
      entityType: 'DEPARTMENT',
      entityId: departmentId,
      action: 'UPDATE',
      oldData: existing,
      newData: dto,
      performByUserId: actor.userId! ?? null,
      performByEmployeeId: actor.employeeId! ?? null,
      ipAddress: req.ipAddress,
      userAgent: req.userAgent,
      tenantId: actor.tenantId,
    });

    return { ...existing, ...dto };
  }

  // ==============================
  // DELETE (HARD)
  // ==============================
  async delete(
    departmentId: string,
    actor: {
      tenantId: string;
      userId?: string;
      employeeId?: string;
      role?: string;
      department?: string;
    },
    req: { ipAddress?: string; userAgent?: string },
  ) {
    const existing = await this.findByIdOrThrow(departmentId, actor.tenantId);

    await this.db
      .delete(departmentTable)
      .where(eq(departmentTable.id, departmentId));

    // 🧾 AUDIT LOG
    await this.audit.create({
      entityType: 'DEPARTMENT',
      entityId: departmentId,
      action: 'DELETE',
      oldData: existing,
      newData: undefined,
      performByUserId: actor.userId! ?? null,
      performByEmployeeId: actor.employeeId! ?? null,
      ipAddress: req.ipAddress,
      userAgent: req.userAgent,
      tenantId: actor.tenantId,
    });

    return { id: departmentId, deleted: true };
  }

  // ==============================
  // HELPERS
  // ==============================
  private async findByIdOrThrow(id: string, tenantId: string) {
    const [dept] = await this.db
      .select()
      .from(departmentTable)
      .where(
        and(eq(departmentTable.id, id), eq(departmentTable.tenantId, tenantId)),
      )
      .limit(1);

    if (!dept) {
      throw new NotFoundException('Department not found');
    }

    return dept;
  }
}
