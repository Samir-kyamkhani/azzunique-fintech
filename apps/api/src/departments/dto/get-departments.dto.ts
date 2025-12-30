import { IsOptional } from 'class-validator';

export class GetDepartmentsDto {
  @IsOptional()
  page?: number;

  @IsOptional()
  limit?: number;

  @IsOptional()
  search?: string;
}
