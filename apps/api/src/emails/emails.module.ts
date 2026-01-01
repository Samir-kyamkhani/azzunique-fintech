import { Module } from '@nestjs/common';
import { EmailsService } from './emails.service';
import { EmailsController } from './emails.controller';
import { SmtpConfigsModule } from 'src/smtp-configs/smtp-configs.module';

@Module({
  imports: [SmtpConfigsModule],
  controllers: [EmailsController],
  providers: [EmailsService],
  exports: [EmailsService],
})
export class EmailsModule {}
