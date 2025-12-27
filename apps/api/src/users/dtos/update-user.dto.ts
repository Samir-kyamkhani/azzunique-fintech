import { IsOptional, IsString, IsBoolean, IsIn } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsBoolean()
  isKycVerified?: boolean;

  @IsIn(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'DELETED'])
  @IsString()
  userStatus?: string;

  @IsOptional()
  @IsString()
  actionReason?: string;
}
