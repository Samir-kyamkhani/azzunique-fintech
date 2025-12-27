import { IsString, IsOptional, IsNotEmpty, MaxLength } from 'class-validator';

export class UpdateRoleDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  roleCode?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  roleName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  roleDescription?: string | null;
}
