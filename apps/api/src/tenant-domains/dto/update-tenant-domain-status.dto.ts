// dto/update-tenant-domain-status.dto.ts
import { IsIn } from 'class-validator';

export class UpdateTenantDomainStatusDto {
  @IsIn(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'DELETED'])
  status!: string;
}
