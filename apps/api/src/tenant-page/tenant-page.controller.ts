import { Controller } from '@nestjs/common';
import { TenantPageService } from './tenant-page.service';

@Controller('tenant-page')
export class TenantPageController {
  constructor(private readonly tenantPageService: TenantPageService) {}
}
