import { IsIn } from 'class-validator';

export class UpdateTenantStatusDto {
  @IsIn(['ACTIVE', 'INACTIVE', 'SUSPENDED'])
  tenantStatus?: string;
}
