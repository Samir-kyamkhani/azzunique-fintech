import { IsIn, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateTenantDomainDto {
  @IsOptional()
  @IsString()
  domainName?: string;

  @IsOptional()
  @IsIn(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'DELETED'])
  status?: string;

  @IsOptional()
  @IsUUID()
  serverDetailId?: string;
}
