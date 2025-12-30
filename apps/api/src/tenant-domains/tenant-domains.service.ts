import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, eq, like, sql } from 'drizzle-orm';

import { CoreDbService } from 'src/db/core/drizzle';
import { tenantsDomainsTable } from 'src/db/core/schema';

import { CreateTenantDomainDto } from './dto/create-tenant-domain.dto';
import { UpdateTenantDomainDto } from './dto/update-tenant-domain.dto';
import { UpdateTenantDomainStatusDto } from './dto/update-tenant-domain-status.dto';

import { AuditlogService } from 'src/auditlog/auditlog.service';
import { randomUUID } from 'node:crypto';
import { GetTenantDomainsDto } from './dto/get-tenant-domains.dto';

@Injectable()
export class TenantDomainsService {
  constructor(
    private readonly db: CoreDbService,
    private readonly audit: AuditlogService,
  ) {}

  // ==============================
  // GET ALL
  // ==============================
  async getAll(
    query: GetTenantDomainsDto,
    actor: {
      tenantId: string;
    },
  ) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);
    const offset = (page - 1) * limit;

    const conditions = [eq(tenantsDomainsTable.tenantId, actor.tenantId)];

    if (query.status) {
      conditions.push(eq(tenantsDomainsTable.status, query.status));
    }

    if (query.domainName) {
      conditions.push(
        like(tenantsDomainsTable.domainName, `%${query.domainName}%`),
      );
    }

    const data = await this.db
      .select()
      .from(tenantsDomainsTable)
      .where(and(...conditions))
      .orderBy(sql`${tenantsDomainsTable.createdAt} DESC`)
      .limit(limit)
      .offset(offset);

    const countResult = await this.db
      .select({
        count: sql<number>`count(*)`,
      })
      .from(tenantsDomainsTable)
      .where(conditions.length ? and(...conditions) : undefined);

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

  // ==============================
  // CREATE
  // ==============================
  async create(
    dto: CreateTenantDomainDto,
    actor: {
      userId?: string;
      employeeId?: string;
      tenantId: string;
      role?: string;
      department?: string;
    },
    req: { ipAddress?: string; userAgent?: string },
  ) {
    const existing = await this.db
      .select()
      .from(tenantsDomainsTable)
      .where(eq(tenantsDomainsTable.domainName, dto.domainName))
      .limit(1);

    if (existing.length) {
      throw new BadRequestException('Domain already exists');
    }

    const domainId = randomUUID();
    const tenantNumberId = this.generateTenantNumber();

    await this.db.insert(tenantsDomainsTable).values({
      id: domainId,
      tenantId: tenantNumberId,
      domainName: dto.domainName,
      status: dto.status ?? 'INACTIVE',
      createdByUserId: dto.createdByUserId ?? null,
      createdByEmployeeId: dto.createdByEmployeeId ?? null,
      serverDetailId: dto.serverDetailId ?? null,
    });

    // 🧾 AUDIT LOG
    await this.audit.create({
      entityType: 'TENANT_DOMAIN',
      entityId: domainId,
      action: 'CREATE',
      oldData: undefined,
      newData: dto,
      performByUserId: actor.userId!,
      performByEmployeeId: actor.employeeId,
      ipAddress: req.ipAddress,
      userAgent: req.userAgent,
      tenantId: actor.tenantId,
    });

    return { id: domainId };
  }

  // ==============================
  // UPDATE
  // ==============================
  async update(
    domainId: string,
    dto: UpdateTenantDomainDto,
    actor: {
      userId?: string;
      employeeId?: string;
      tenantId: string;
      role?: string;
      department?: string;
    },
    req: { ipAddress?: string; userAgent?: string },
  ) {
    const existing = await this.findById(domainId);

    await this.db
      .update(tenantsDomainsTable)
      .set({
        ...dto,
        updatedAt: new Date(),
      })
      .where(eq(tenantsDomainsTable.id, domainId));

    // 🧾 AUDIT LOG
    await this.audit.create({
      entityType: 'TENANT_DOMAIN',
      entityId: domainId,
      action: 'UPDATE',
      oldData: existing,
      newData: dto,
      performByUserId: actor.userId!,
      performByEmployeeId: actor.employeeId,
      ipAddress: req.ipAddress,
      userAgent: req.userAgent,
      tenantId: actor.tenantId,
    });

    return { ...existing, ...dto };
  }

  // ==============================
  // UPDATE STATUS
  // ==============================
  async updateStatus(
    domainId: string,
    dto: UpdateTenantDomainStatusDto,
    actor: {
      userId?: string;
      employeeId?: string;
      tenantId: string;
      role?: string;
      department?: string;
    },
    req: { ipAddress?: string; userAgent?: string },
  ) {
    const existing = await this.findById(domainId);

    await this.db
      .update(tenantsDomainsTable)
      .set({
        status: dto.status,
        updatedAt: new Date(),
      })
      .where(eq(tenantsDomainsTable.id, domainId));

    // 🧾 AUDIT LOG
    await this.audit.create({
      entityType: 'TENANT_DOMAIN',
      entityId: domainId,
      action: 'STATUS_CHANGE',
      oldData: { status: existing?.status ?? 'UNKNOWN' },
      newData: { status: dto.status },
      performByUserId: actor.userId!,
      performByEmployeeId: actor.employeeId,
      ipAddress: req.ipAddress,
      userAgent: req.userAgent,
      tenantId: actor.tenantId,
      metaData: {
        reason: 'Manual status update',
      },
    });

    return { id: domainId, status: dto.status };
  }

  // ==============================
  // HELPERS
  // ==============================
  private async findById(id: string) {
    const result = await this.db
      .select()
      .from(tenantsDomainsTable)
      .where(eq(tenantsDomainsTable.id, id))
      .limit(1);

    if (!result.length) {
      throw new NotFoundException('Tenant domain not found');
    }

    return result[0];
  }

  private generateTenantNumber() {
    const num = Math.floor(1000 + Math.random() * 9000);
    return `TEN-DOM-${num}`;
  }
}
