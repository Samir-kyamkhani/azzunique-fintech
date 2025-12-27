// dto/get-tenants.dto.ts
import { IsOptional, IsString, IsNumberString, IsIn } from 'class-validator';

export class GetTenantsDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsIn(['ACTIVE', 'INACTIVE', 'SUSPENDED'])
  tenantStatus?: string;

  @IsOptional()
  @IsNumberString()
  page?: string;

  @IsOptional()
  @IsNumberString()
  limit?: string;
}
