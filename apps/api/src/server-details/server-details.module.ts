import { Module } from '@nestjs/common';
import { ServerDetailsService } from './server-details.service';
import { ServerDetailsController } from './server-details.controller';
import { DbModule } from 'src/db/db.module';
import { AuditlogModule } from 'src/auditlog/auditlog.module';

@Module({
  imports: [DbModule, AuditlogModule],
  controllers: [ServerDetailsController],
  providers: [ServerDetailsService],
})
export class ServerDetailsModule {}
