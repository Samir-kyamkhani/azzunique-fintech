import { Module } from '@nestjs/common';
import { HealthController } from './health/health.controller';
import { HealthService } from './health/health.service';
import { TenantsModule } from './tenants/tenants.module';
import { TenantDomainsModule } from './tenant-domains/tenant-domains.module';
import { RolesModule } from './roles/roles.module';
import { UsersModule } from './users/users.module';
import { EmployeesModule } from './employees/employees.module';
import { AuditlogModule } from './auditlog/auditlog.module';
import { RolesPermissionsModule } from './roles-permissions/roles-permissions.module';
import { PermissionsModule } from './permissions/permissions.module';
import { UsersPermissionsModule } from './users-permissions/users-permissions.module';
import { EmployeesPermissionsModule } from './employees-permissions/employees-permissions.module';
import { DepartmentsPermissionsModule } from './departments-permissions/departments-permissions.module';
import { DepartmentsModule } from './departments/departments.module';
import { ConfigModule } from '@nestjs/config';
import { ServerDetailsModule } from './server-details/server-details.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TenantsModule,
    TenantDomainsModule,
    RolesModule,
    UsersModule,
    EmployeesModule,
    AuditlogModule,
    RolesPermissionsModule,
    PermissionsModule,
    UsersPermissionsModule,
    EmployeesPermissionsModule,
    DepartmentsPermissionsModule,
    DepartmentsModule,
    ServerDetailsModule,
  ],
  controllers: [HealthController],
  providers: [HealthService],
})
export class AppModule {}
