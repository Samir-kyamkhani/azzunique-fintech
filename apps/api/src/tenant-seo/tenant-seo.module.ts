import { Module } from '@nestjs/common';
import { TenantSeoService } from './tenant-seo.service';
import { TenantSeoController } from './tenant-seo.controller';

@Module({
  controllers: [TenantSeoController],
  providers: [TenantSeoService],
})
export class TenantSeoModule {}
