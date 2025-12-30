import { Module } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { EmployeesController } from './employees.controller';
import { AuditlogModule } from 'src/auditlog/auditlog.module';
import { DbModule } from 'src/db/db.module';
import { UtilsModule } from 'src/lib/utils/utils.module';
import { EmailsModule } from 'src/emails/emails.module';
import { EventsModule } from 'src/events/events.module';

@Module({
  imports: [AuditlogModule, DbModule, UtilsModule, EmailsModule, EventsModule],
  controllers: [EmployeesController],
  providers: [EmployeesService],
  exports: [EmployeesService],
})
export class EmployeesModule {}
