import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsIn,
} from 'class-validator';

export class CreateTenantDto {
 

  @IsNotEmpty()
  @IsString()
  tenantName: string;

  @IsNotEmpty()
  @IsString()
  tenantLegalName: string;

  @IsIn(['PROPRIETORSHIP', 'PARTNERSHIP', 'PRIVATE_LIMITED'])
  tenantType: string;

  @IsIn(['AZZUNIQUE', 'RESELLER', 'WHITELABEL'])
  userType: string;

  @IsEmail()
  tenantEmail: string;

  @IsNotEmpty()
  tenantWhatsapp: string;

  @IsNotEmpty()
  tenantMobileNumber: string;

  @IsOptional()
  parentTenantId: string;

  @IsOptional()
  createdByEmployeeId?: string;
}
