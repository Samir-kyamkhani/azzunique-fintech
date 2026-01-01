import { Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';

import { CoreDbService } from 'src/db/core/drizzle';
import { smtpConfigTable } from 'src/db/core/schema';
import { AuthUtilsService } from 'src/lib/utils/auth-utils';

import { CreateSmtpConfigDto } from './dto/create-smtp-config.dto';

@Injectable()
export class SmtpConfigsService {
  constructor(
    private readonly db: CoreDbService,
    private readonly authUtils: AuthUtilsService,
  ) {}

  // =====================================================
  // CREATE OR UPDATE (ONE TIME CREATE, MANY UPDATE)
  // =====================================================
  async upsert(
    dto: CreateSmtpConfigDto,
    actor: {
      tenantId: string;
      userId: string;
      employeeId?: string;
    },
  ) {
    const encryptedPassword = this.authUtils.encrypt(dto.smtpPassword);

    const [existing] = await this.db
      .select()
      .from(smtpConfigTable)
      .where(eq(smtpConfigTable.tenantId, actor.tenantId))
      .limit(1);

    // ================= UPDATE =================
    if (existing) {
      await this.db
        .update(smtpConfigTable)
        .set({
          smtpHost: dto.smtpHost,
          smtpPort: dto.smtpPort,
          smtpUsername: dto.smtpUsername,
          smtpPassword: encryptedPassword,
          encryptionType: dto.encryptionType,
          fromName: dto.fromName,
          fromEmail: dto.fromEmail,
          updatedAt: new Date(),
        })
        .where(eq(smtpConfigTable.id, existing.id));

      return { id: existing.id, updated: true };
    }

    // ================= CREATE =================
    const insertData = {
      smtpHost: dto.smtpHost,
      smtpPort: dto.smtpPort,
      smtpUsername: dto.smtpUsername,
      smtpPassword: encryptedPassword,
      encryptionType: dto.encryptionType,
      fromName: dto.fromName,
      fromEmail: dto.fromEmail,
      tenantId: actor.tenantId,
      createdByUserId: actor.userId,
      createdByEmployeeId: actor.employeeId ?? null,
    };

    await this.db.insert(smtpConfigTable).values(insertData);

    return { created: true };
  }

  // =====================================================
  // GET DECRYPTED (MAILER / INTERNAL USE)
  // =====================================================
  async getDecryptedForMailer(tenantId: string) {
    const [config] = await this.db
      .select()
      .from(smtpConfigTable)
      .where(eq(smtpConfigTable.tenantId, tenantId))
      .limit(1);

    if (!config) {
      throw new NotFoundException('SMTP config not found');
    }

    return {
      ...config,
      smtpPassword: this.authUtils.decrypt(config.smtpPassword),
    };
  }
}
