import { Module } from '@nestjs/common';
import { HealthController } from './health/health.controller';
import { HealthService } from './health/health.service';
import { TenantsModule } from './tenants/tenants.module';
import { TenantDomainsModule } from './tenant-domains/tenant-domains.module';
import { AuthModule } from './auth/auth.module';
import { RolesModule } from './roles/roles.module';
import { UsersModule } from './users/users.module';
import { EmployeesModule } from './employees/employees.module';
import { AuditlogModule } from './auditlog/auditlog.module';

@Module({
  controllers: [HealthController],
  providers: [HealthService],
  imports: [
    TenantsModule,
    TenantDomainsModule,
    AuthModule,
    RolesModule,
    UsersModule,
    EmployeesModule,
    AuditlogModule,
  ],
})
export class AppModule {}
