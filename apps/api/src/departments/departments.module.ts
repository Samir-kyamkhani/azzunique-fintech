import { Module } from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { DepartmentsController } from './departments.controller';
import { DbModule } from 'src/db/db.module';
import { AuditlogModule } from 'src/auditlog/auditlog.module';

@Module({
  imports: [DbModule, AuditlogModule],
  controllers: [DepartmentsController],
  providers: [DepartmentsService],
})
export class DepartmentsModule {}
