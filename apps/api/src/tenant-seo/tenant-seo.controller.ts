import { Controller } from '@nestjs/common';
import { TenantSeoService } from './tenant-seo.service';

@Controller('tenant-seo')
export class TenantSeoController {
  constructor(private readonly tenantSeoService: TenantSeoService) {}
}
