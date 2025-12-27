import { Module } from '@nestjs/common';
import { TenantDomainsService } from './tenant-domains.service';
import { TenantDomainsController } from './tenant-domains.controller';
import { DbModule } from 'src/db/db.module';
import { AuditlogModule } from 'src/auditlog/auditlog.module';

@Module({
  imports: [DbModule, AuditlogModule],
  controllers: [TenantDomainsController],
  providers: [TenantDomainsService],
})
export class TenantDomainsModule {}
