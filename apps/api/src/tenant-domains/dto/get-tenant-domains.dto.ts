import { IsOptional, IsString, IsNumberString, IsIn } from 'class-validator';

export class GetTenantDomainsDto {
  @IsOptional()
  @IsString()
  domainName?: string;

  @IsOptional()
  @IsIn(['ACTIVE', 'INACTIVE', 'PENDING'])
  status?: string;

  @IsOptional()
  @IsNumberString()
  page?: string; // default 1

  @IsOptional()
  @IsNumberString()
  limit?: string; // default 10
}
