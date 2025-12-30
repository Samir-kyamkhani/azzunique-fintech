import { Injectable, Logger } from '@nestjs/common';
import { EmailsService } from 'src/emails/emails.service';
import { EventBusService } from 'src/events/event-bus';
import { EmployeeCreatedEvent } from 'src/events/interfaces';

@Injectable()
export class EmployeeEmailListener {
  private readonly logger = new Logger(EmployeeEmailListener.name);

  constructor(
    private readonly emailService: EmailsService,
    private readonly eventBus: EventBusService,
  ) {
    this.register();
  }

  private register() {
    this.eventBus.on('employee.created', (payload: EmployeeCreatedEvent) => {
      // 👇 explicitly ignore returned promise
      void this.handleEmployeeCreated(payload);
    });
  }

  private async handleEmployeeCreated(payload: EmployeeCreatedEvent) {
    try {
      this.logger.log(`Sending email to ${payload.email}`);
      await this.emailService.sendEmployeeCredentials(payload);
      this.logger.log(`Email sent to ${payload.email}`);
    } catch (err) {
      this.logger.error(`Email failed for ${payload.email}`, err);
    }
  }
}
