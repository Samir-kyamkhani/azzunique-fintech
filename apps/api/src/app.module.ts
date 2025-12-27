import { Module } from '@nestjs/common';
import { HealthController } from './health/health.controller';
import { HealthService } from './health/health.service';
import { TenantsModule } from './tenants/tenants.module';
import { TenantDomainsModule } from './tenant-domains/tenant-domains.module';
import { TenantPageModule } from './tenant-page/tenant-page.module';
import { TenantSeoModule } from './tenant-seo/tenant-seo.module';
import { TenantWebsiteModule } from './tenant-website/tenant-website.module';
import { AuditlogModule } from './auditlog/auditlog.module';

@Module({
  controllers: [HealthController],
  providers: [HealthService],
  imports: [TenantsModule, TenantDomainsModule, TenantPageModule, TenantSeoModule, TenantWebsiteModule, AuditlogModule],
})
export class AppModule {}
