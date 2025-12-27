import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateTenantDomainDto {
  @IsString()
  @IsNotEmpty()
  domainName: string;

  @IsIn(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'DELETED'])
  status: string;

  @IsOptional()
  @IsUUID()
  createdByUserId: string;

  @IsOptional()
  @IsUUID()
  createdByEmployeeId?: string;

  @IsOptional()
  @IsUUID()
  serverDetailId: string;
}
