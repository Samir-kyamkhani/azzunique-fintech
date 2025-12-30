import { IsIn, IsOptional, IsUUID } from 'class-validator';

export class GetEmployeesDto {
  @IsOptional()
  page?: number;

  @IsOptional()
  limit?: number;

  @IsOptional()
  search?: string; // firstName / lastName / email

  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @IsOptional()
  @IsIn(['ACTIVE', 'INACTIVE', 'SUSPENDED'])
  employeeStatus?: string;
}
