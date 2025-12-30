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
    this.eventBus.on(
      'employee.created',
      async (payload: EmployeeCreatedEvent) => {
        try {
          console.log(`Sending email to ${payload.email}`);
          await this.emailService.sendEmployeeCredentials(payload);
          console.log(`Sending email to ${payload.email} - Success`);
        } catch (err) {
          this.logger.error(`Email failed for ${payload.email}`, err);
        }
      },
    );
  }
}
