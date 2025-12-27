import {
  IsString,
  IsEmail,
  IsOptional,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MaxLength(30)
  userNumber: string;

  @IsString()
  @MaxLength(100)
  firstName: string;

  @IsString()
  @MaxLength(100)
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  @MaxLength(20)
  mobileNumber: string;

  @IsString()
  passwordHash: string;

  @IsOptional()
  @IsString()
  transactionPinHash?: string;

  @IsUUID()
  roleId: string;

  @IsUUID()
  tenantId: string;

  @IsOptional()
  @IsUUID()
  createdByEmployeeId?: string;

  @IsOptional()
  @IsUUID()
  parentId?: string;
}
