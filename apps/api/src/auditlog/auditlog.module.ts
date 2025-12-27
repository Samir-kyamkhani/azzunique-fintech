import { Module } from '@nestjs/common';
import { AuditlogService } from './auditlog.service';
import { AuditlogController } from './auditlog.controller';
import { DbModule } from 'src/db/db.module';

@Module({
  imports: [DbModule],
  controllers: [AuditlogController],
  providers: [AuditlogService],
  exports: [AuditlogService],
})
export class AuditlogModule {}
