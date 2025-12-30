import { Module } from '@nestjs/common';
import { EmployeeEmailListener } from './employee-email.listener';
import { EventsModule } from 'src/events/events.module';
import { EmailsModule } from 'src/emails/emails.module';

@Module({
  imports: [EventsModule, EmailsModule],
  providers: [EmployeeEmailListener],
  exports: [EmployeeEmailListener],
})
export class ListenersModule {}
