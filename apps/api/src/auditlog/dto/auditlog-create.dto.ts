import { IsOptional, IsString, IsObject } from 'class-validator';

export class CreateAuditLogDto {
  @IsString()
  entityType!: string;

  @IsString()
  entityId!: string;

  @IsString()
  action!: string;

  @IsOptional()
  @IsObject()
  oldData?: Record<string, any>;

  @IsOptional()
  @IsObject()
  newData?: Record<string, any>;

  @IsString()
  performByUserId!: string;

  @IsOptional()
  @IsString()
  performByEmployeeId?: string;

  @IsOptional()
  @IsString()
  ipAddress?: string;

  @IsOptional()
  @IsString()
  userAgent?: string;

  @IsString()
  tenantId!: string;

  @IsOptional()
  @IsObject()
  metaData?: Record<string, any>;
}
