import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class LoginAuditDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  employeeId?: string;

  @IsString()
  tenantId!: string;

  @IsBoolean()
  success!: boolean;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  ipAddress?: string;

  @IsOptional()
  @IsString()
  userAgent?: string;
}
