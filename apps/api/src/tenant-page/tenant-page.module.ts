import { Module } from '@nestjs/common';
import { TenantPageService } from './tenant-page.service';
import { TenantPageController } from './tenant-page.controller';

@Module({
  controllers: [TenantPageController],
  providers: [TenantPageService],
})
export class TenantPageModule {}
