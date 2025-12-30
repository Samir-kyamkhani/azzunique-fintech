import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateDepartmentDto {
  @IsNotEmpty()
  @IsString()
  departmentCode: string;

  @IsNotEmpty()
  @IsString()
  departmentName: string;

  @IsOptional()
  @IsString()
  departmentDescription?: string;
}
