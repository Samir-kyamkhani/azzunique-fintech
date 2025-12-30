import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';

import { CoreDbService } from 'src/db/core/drizzle';
import { serverDetailTable, usersTable } from 'src/db/core/schema';
import { AuditlogService } from 'src/auditlog/auditlog.service';

import { CreateServerDetailDto } from './dto/create-server-detail.dto';
import { UpdateServerDetailDto } from './dto/update-server-detail.dto';
import { UpdateServerStatusDto } from './dto/update-server-status.dto';

@Injectable()
export class ServerDetailsService {
  constructor(
    private readonly db: CoreDbService,
    private readonly audit: AuditlogService,
  ) {}

  // ==============================
  // CREATE
  // ==============================
  async create(
    dto: CreateServerDetailDto,
    actor: {
      userId?: string;
      employeeId?: string;
      tenantId: string;
    },
    req: { ipAddress?: string; userAgent?: string },
  ) {
    if (!actor.userId) {
      throw new BadRequestException('Invalid user context');
    }

    // Validate user FK
    const [user] = await this.db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.id, actor.userId))
      .limit(1);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const serverId = randomUUID();

    await this.db.insert(serverDetailTable).values({
      id: serverId,
      recordType: dto.recordType,
      hostname: dto.hostname,
      value: dto.value,
      status: dto.status ?? 'ACTIVE',
      createdByUserId: actor.userId,
      createdByEmployeeId: actor.employeeId ?? null,
    });

    // 🧾 AUDIT LOG
    await this.audit.create({
      entityType: 'SERVER_DETAIL',
      entityId: serverId,
      action: 'CREATE',
      oldData: undefined,
      newData: dto,
      performByUserId: actor.userId,
      performByEmployeeId: actor.employeeId! ?? null,
      ipAddress: req.ipAddress,
      userAgent: req.userAgent,
      tenantId: actor.tenantId,
    });

    return { id: serverId };
  }

  // ==============================
  // UPDATE
  // ==============================
  async update(serverId: string, dto: UpdateServerDetailDto) {
    const existing = await this.findByIdOrThrow(serverId);

    await this.db
      .update(serverDetailTable)
      .set({ ...dto, updatedAt: new Date() })
      .where(eq(serverDetailTable.id, serverId));

    return { ...existing, ...dto };
  }

  // ==============================
  // UPDATE STATUS
  // ==============================
  async updateStatus(serverId: string, dto: UpdateServerStatusDto) {
    await this.findByIdOrThrow(serverId);

    await this.db
      .update(serverDetailTable)
      .set({ status: dto.status, updatedAt: new Date() })
      .where(eq(serverDetailTable.id, serverId));

    return { id: serverId, status: dto.status };
  }

  // ==============================
  // HELPERS
  // ==============================
  private async findByIdOrThrow(id: string) {
    const [server] = await this.db
      .select()
      .from(serverDetailTable)
      .where(eq(serverDetailTable.id, id))
      .limit(1);

    if (!server) {
      throw new NotFoundException('Server detail not found');
    }

    return server;
  }
}
