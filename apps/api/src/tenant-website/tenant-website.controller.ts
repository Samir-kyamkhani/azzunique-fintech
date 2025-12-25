import { Controller } from '@nestjs/common';
import { TenantWebsiteService } from './tenant-website.service';

@Controller('tenant-website')
export class TenantWebsiteController {
  constructor(private readonly tenantWebsiteService: TenantWebsiteService) {}
}
