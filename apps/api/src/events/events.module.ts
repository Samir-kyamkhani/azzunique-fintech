import { Module } from '@nestjs/common';
import { EmailsModule } from 'src/emails/emails.module';
import { EventBusService } from './event-bus';

@Module({
  imports: [EmailsModule],
  providers: [EventBusService],
  exports: [EventBusService],
})
export class EventsModule {}
