import { IsIn, IsOptional, IsString } from 'class-validator';

export class UpdateEmployeeStatusDto {
  @IsIn(['ACTIVE', 'INACTIVE', 'SUSPENDED'])
  employeeStatus!: string;

  @IsOptional()
  @IsString()
  actionReason?: string;
}
