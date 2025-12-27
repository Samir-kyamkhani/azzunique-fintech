import { Injectable, NotFoundException } from '@nestjs/common';
import { and, desc, eq, SQL } from 'drizzle-orm';
import { CoreDbService } from 'src/db/core/drizzle';
import { auditLogTable } from 'src/db/core/schema';
import { AuditLogQueryDto, CreateAuditLogDto, LoginAuditDto } from '@repo/api';

@Injectable()
export class AuditlogService {
  constructor(private readonly db: CoreDbService) {}

  async create(dto: CreateAuditLogDto) {
    const [result] = await this.db.insert(auditLogTable)
      .values({
        entityType: dto.entityType,
        entityId: dto.entityId,
        action: dto.action,

        oldData: dto.oldData ?? null,
        newData: dto.newData ?? null,

        performByUserId: dto.performByUserId,
        performByEmployeeId: dto.performByEmployeeId ?? null,

        ipAddress: dto.ipAddress ?? null,
        userAgent: dto.userAgent ?? null,

        tenantId: dto.tenantId,
        metaData: dto.metaData ?? null,
      })
      .$returningId();

    return result;
  }

  // =========================
  // GET ALL (PAGINATED)
  // =========================
  async getAll(query: AuditLogQueryDto) {
    const { page = 1, limit = 20, entityType, action, tenantId } = query;
    const offset = (page - 1) * limit;

    const filters: SQL[] = [];
    if (entityType) filters.push(eq(auditLogTable.entityType, entityType));
    if (action) filters.push(eq(auditLogTable.action, action));
    if (tenantId) filters.push(eq(auditLogTable.tenantId, tenantId));

    const data = await this.db.select()
      .from(auditLogTable)
      .where(filters.length ? and(...filters) : undefined)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(auditLogTable.createdAt));

    return {
      page,
      limit,
      count: data.length,
      data,
    };
  }

  // =========================
  // GET ONE
  // =========================
  async getById(id: string) {
    const [log] = await this.db.select()
      .from(auditLogTable)
      .where(eq(auditLogTable.id, id))
      .limit(1);

    if (!log) {
      throw new NotFoundException('Audit log not found');
    }

    return log;
  }

  // =========================
  // DELETE (Hard delete)
  // =========================
  async delete(id: string) {
    const exists = await this.db.select({ id: auditLogTable.id })
      .from(auditLogTable)
      .where(eq(auditLogTable.id, id))
      .limit(1);

    if (!exists.length) {
      throw new NotFoundException('Audit log not found');
    }

    await this.db.delete(auditLogTable).where(eq(auditLogTable.id, id));

    return { success: true };
  }

  // =========================
  // LOGIN AUDIT (CORRECT)
  // =========================
  async logLogin(dto: LoginAuditDto) {
    await this.create({
      entityType: dto.employeeId ? 'EMPLOYEE' : 'USER',
      entityId: dto.employeeId ?? dto.userId!,
      action: dto.success ? 'LOGIN_SUCCESS' : 'LOGIN_FAILED',

      oldData: null,
      newData: {
        success: dto.success,
        reason: dto.reason ?? null,
      },

      performByUserId: dto.userId ?? dto.employeeId!,
      performByEmployeeId: dto.employeeId ?? null,

      tenantId: dto.tenantId,
      ipAddress: dto.ipAddress,
      userAgent: dto.userAgent,

      metaData: {
        module: 'AUTH',
        type: 'LOGIN',
      },
    });
  }
}
