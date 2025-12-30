import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, eq, isNull, like, sql } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';

import { CoreDbService } from 'src/db/core/drizzle';
import { tenantsTable } from 'src/db/core/schema';
import { AuditlogService } from 'src/auditlog/auditlog.service';

import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { UpdateTenantStatusDto } from './dto/update-tenant-status.dto';
import { GetTenantsDto } from './dto/get-tenants.dto';

@Injectable()
export class TenantsService {
  constructor(
    private readonly audit: AuditlogService,
    private readonly db: CoreDbService,
  ) {}

  // ==============================
  // GET ALL
  // ==============================
  async getAll(
    query: GetTenantsDto,
    // actor: {
    //   tenantId: string;
    // },
  ) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);
    const offset = (page - 1) * limit;

    // const conditions = [eq(tenantsTable.parentTenantId, actor.tenantId)];
    const conditions = [isNull(tenantsTable.parentTenantId)];
    if (query.tenantStatus) {
      conditions.push(eq(tenantsTable.tenantStatus, query.tenantStatus));
    }

    if (query.search) {
      conditions.push(like(tenantsTable.tenantName, `%${query.search}%`));
    }

    const data = await this.db
      .select()
      .from(tenantsTable)
      .where(and(...conditions))
      .orderBy(sql`${tenantsTable.createdAt} DESC`)
      .limit(limit)
      .offset(offset);

    const countResult = await this.db
      .select({
        count: sql<number>`count(*)`,
      })
      .from(tenantsTable)
      .where(and(...conditions));

    const count = countResult[0]?.count ?? 0;

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

  // =========================
  // CREATE
  // =========================
  async create(
    dto: CreateTenantDto,
    // actor: {
    //   userId?: string;
    //   employeeId?: string;
    //   tenantId: string;
    //   role?: string;
    //   department?: string;
    // },
    // req: { ipAddress?: string; userAgent?: string },
  ) {
    if (dto.userType === 'AZZUNIQUE') {
      const [azzunique] = await this.db
        .select({ id: tenantsTable.id })
        .from(tenantsTable)
        .where(eq(tenantsTable.userType, 'AZZUNIQUE'))
        .limit(1);

      if (azzunique) {
        throw new BadRequestException('AZZUNIQUE tenant already exists');
      }
    }

    //  Normal duplicate email check
    const [existing] = await this.db
      .select({ id: tenantsTable.id })
      .from(tenantsTable)
      .where(eq(tenantsTable.tenantEmail, dto.tenantEmail))
      .limit(1);

    if (existing) {
      throw new BadRequestException('Tenant already exists');
    }

    const tenantId = randomUUID();
    const tenantNumber = await this.generateTenantNumber();

    await this.db.insert(tenantsTable).values({
      id: tenantId,
      ...dto,
      tenantNumber,
      tenantStatus: 'ACTIVE',
    });

    // await this.audit.create({
    //   entityType: 'TENANT',
    //   entityId: tenantId,
    //   action: 'CREATE',
    //   oldData: null,
    //   newData: dto,
    //   performByUserId: actor.userId,
    //   performByEmployeeId: actor.employeeId,
    //   ipAddress: req.ipAddress,
    //   userAgent: req.userAgent,
    //   tenantId: actor.tenantId,
    // });

    return { message: 'Tenant created successfully', tenantId };
  }

  // =========================
  // UPDATE
  // =========================
  async update(
    tenantId: string,
    dto: UpdateTenantDto,
    // actor: {
    //   userId?: string;
    //   employeeId?: string;
    //   tenantId: string;
    //   role?: string;
    //   department?: string;
    // },
    // req: { ipAddress?: string; userAgent?: string },
  ) {
    const existing = await this.findByIdOrThrow(tenantId);

    await this.db
      .update(tenantsTable)
      .set({ ...dto, updatedAt: new Date() })
      .where(eq(tenantsTable.id, tenantId));

    // await this.audit.create({
    //   entityType: 'TENANT',
    //   entityId: tenantId,
    //   action: 'UPDATE',
    //   oldData: existing,
    //   newData: dto,
    //   performByUserId: actor.userId,
    //   performByEmployeeId: actor.employeeId,
    //   ipAddress: req.ipAddress,
    //   userAgent: req.userAgent,
    //   tenantId: actor.tenantId,
    // });

    return { message: 'Tenant updated successfully' };
  }

  // =========================
  // UPDATE STATUS
  // =========================
  async updateStatus(
    tenantId: string,
    dto: UpdateTenantStatusDto,
    // actor: {
    //   userId?: string;
    //   employeeId?: string;
    //   tenantId: string;
    //   role?: string;
    //   department?: string;
    // },
    // req: { ipAddress?: string; userAgent?: string },
  ) {
    const existing = await this.findByIdOrThrow(tenantId);

    await this.db
      .update(tenantsTable)
      .set({
        tenantStatus: dto.tenantStatus,
        updatedAt: new Date(),
      })
      .where(eq(tenantsTable.id, tenantId));

    // await this.audit.create({
    //   entityType: 'TENANT',
    //   entityId: tenantId,
    //   action: 'STATUS_CHANGE',
    //   oldData: { tenantStatus: existing.tenantStatus },
    //   newData: dto,
    //   tenantId: actor.tenantId,
    //   performByUserId: actor.userId,
    //   performByEmployeeId: actor.employeeId,
    //   ipAddress: req.ipAddress,
    //   userAgent: req.userAgent,
    // });

    return { message: 'Tenant status updated successfully' };
  }

  // =========================
  // GET ONE (FIND BY ID)
  // =========================
  async findOne(tenantId: string) {
    const tenant = await this.findByIdOrThrow(tenantId);
    return tenant;
  }

  // =========================
  // DELETE
  // =========================
  async delete(
    tenantId: string,
    // actor: {
    //   userId?: string;
    //   employeeId?: string;
    //   tenantId: string;
    //   role?: string;
    //   department?: string;
    // },
    // req: { ipAddress?: string; userAgent?: string },
  ) {
    const existing = await this.findByIdOrThrow(tenantId);

    await this.db.delete(tenantsTable).where(eq(tenantsTable.id, tenantId));

    // await this.audit.create({
    //   entityType: 'TENANT',
    //   entityId: tenantId,
    //   action: 'DELETE',
    //   oldData: existing,
    //   newData: { tenantStatus: 'DELETED' },
    //   tenantId: actor.tenantId,
    //   performByUserId: actor.userId,
    //   performByEmployeeId: actor.employeeId,
    //   ipAddress: req.ipAddress,
    //   userAgent: req.userAgent,
    // });

    return { message: 'Tenant deleted successfully' };
  }

  // =========================
  // HELPERS
  // =========================
  private async findByIdOrThrow(id: string) {
    const [tenant] = await this.db
      .select()
      .from(tenantsTable)
      .where(eq(tenantsTable.id, id))
      .limit(1);

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return tenant;
  }

  private generateTenantNumber() {
    const num = Math.floor(1000 + Math.random() * 9000);
    return `TEN-${num}`;
  }
}
