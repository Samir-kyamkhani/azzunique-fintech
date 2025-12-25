import { Module } from '@nestjs/common';
import { TenantWebsiteService } from './tenant-website.service';
import { TenantWebsiteController } from './tenant-website.controller';

@Module({
  controllers: [TenantWebsiteController],
  providers: [TenantWebsiteService],
})
export class TenantWebsiteModule {}
