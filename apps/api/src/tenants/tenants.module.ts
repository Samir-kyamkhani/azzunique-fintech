import { Module } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { TenantsController } from './tenants.controller';
import { AuditlogModule } from 'src/auditlog/auditlog.module';
import { DbModule } from 'src/db/db.module';

@Module({
  imports: [AuditlogModule, DbModule],
  controllers: [TenantsController],
  providers: [TenantsService],
})
export class TenantsModule {}
