import { Module } from '@nestjs/common';
import { SmtpConfigsService } from './smtp-configs.service';
import { SmtpConfigsController } from './smtp-configs.controller';
import { DbModule } from 'src/db/db.module';
import { UtilsModule } from 'src/lib/utils/utils.module';

@Module({
  imports: [DbModule, UtilsModule],
  controllers: [SmtpConfigsController],
  providers: [SmtpConfigsService],
})
export class SmtpConfigsModule {}
