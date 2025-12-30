import { Injectable } from '@nestjs/common';
import { EmployeeCreatedEvent } from 'src/events/interfaces';

@Injectable()
export class EmailsService {
  async sendEmployeeCredentials(payload: EmployeeCreatedEvent) {
    // yahan nodemailer / SMTP / SES call hoga
    console.log('📧 Sending credentials email', payload, {
      to: payload.email,
      employeeNumber: payload.employeeNumber,
      password: payload.password,
      tenantId: payload.tenantId,
    });
  }
}
