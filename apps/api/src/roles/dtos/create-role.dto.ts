import { IsString, IsOptional, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  roleCode!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  roleName!: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  roleDescription?: string;
}
