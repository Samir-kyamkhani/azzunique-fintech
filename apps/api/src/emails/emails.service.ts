import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { EmployeeCreatedEvent } from 'src/events/interfaces';
import { SmtpConfigsService } from 'src/smtp-configs/smtp-configs.service';
import nodemailer from 'nodemailer';
import path from 'node:path';
import fs from 'node:fs';
import Handlebars from 'handlebars';

@Injectable()
export class EmailsService {
  constructor(private readonly smtpConfigsService: SmtpConfigsService) {}

  async sendEmployeeCredentials(payload: EmployeeCreatedEvent) {
    try {
      // 1️⃣ Load tenant SMTP (DECRYPTED)
      const smtp = await this.smtpConfigsService.getDecryptedForMailer(
        payload.tenantId,
      );

      // 2️⃣ Nodemailer transport
      const transporter = nodemailer.createTransport({
        host: smtp.smtpHost,
        port: Number(smtp.smtpPort),
        secure: smtp.encryptionType === 'SSL',
        auth: {
          user: smtp.smtpUsername,
          pass: smtp.smtpPassword,
        },
      });

      // 3️⃣ Load HBS template
      const templatePath = path.join(
        process.cwd(),
        'src/emails/templates/employee-credentials.hbs',
      );

      const source = fs.readFileSync(templatePath, 'utf8');
      const template = Handlebars.compile(source);

      // 4️⃣ Inject dynamic data
      const html = template({
        tenantName: payload.tenantName ?? 'Company',
        firstName: payload.firstName,
        employeeNumber: payload.employeeNumber,
        temporaryPassword: payload.password,
        domain: payload.domain,
      });

      // 5️⃣ Send email
      await transporter.sendMail({
        from: `"${smtp.fromName}" <${smtp.fromEmail}>`,
        to: payload.email,
        subject: 'Employee Account Credentials',
        html,
      });

      console.log(`📧 Employee email sent to ${payload.email}`);
    } catch (err) {
      console.error('SMTP send failed', err);
      throw new InternalServerErrorException('Email sending failed');
    }
  }
}
