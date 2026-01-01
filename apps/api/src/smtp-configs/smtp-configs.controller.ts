import { Body, Controller, Get, Put, Req, UseGuards } from '@nestjs/common';

import { SmtpConfigsService } from './smtp-configs.service';
import { CreateSmtpConfigDto } from './dto/create-smtp-config.dto';

// 👉 Example guards (use your actual ones)
// import { AuthGuard } from 'src/lib/guards/auth.guard';
// import { TenantGuard } from 'src/lib/guards/tenant.guard';

@Controller('smtp-configs')
// @UseGuards(AuthGuard, TenantGuard)
export class SmtpConfigsController {
  constructor(private readonly smtpConfigsService: SmtpConfigsService) {}

  // =====================================================
  // CREATE OR UPDATE SMTP CONFIG
  // =====================================================
  @Put()
  async upsert(@Body() dto: CreateSmtpConfigDto, @Req() req: any) {
    /**
     * req.actor should be injected by Auth + Tenant guards
     * Example:
     * {
     *   tenantId: string;
     *   userId: string;
     *   employeeId?: string;
     * }
     */
    return this.smtpConfigsService.upsert(dto, req.actor);
  }

  // =====================================================
  // GET SMTP CONFIG (DECRYPTED) – INTERNAL USE
  // =====================================================
  @Get('internal/decrypted')
  async getDecrypted(@Req() req: any) {
    /**
     * ⚠️ IMPORTANT
     * This endpoint should be:
     * - Internal only
     * - OR protected via service-to-service auth
     * - OR accessible only by system roles
     */
    return this.smtpConfigsService.getDecryptedForMailer(req.actor.tenantId);
  }
}
