import { Controller } from '@nestjs/common';
import { TenantDomainsService } from './tenant-domains.service';

@Controller('tenant-domains')
export class TenantDomainsController {
  constructor(private readonly tenantDomainsService: TenantDomainsService) {}
}
