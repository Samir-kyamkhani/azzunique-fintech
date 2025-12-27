import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateServerDetailDto {
  @IsString()
  @IsNotEmpty()
  recordType: string; // A | CNAME | TXT | MX

  @IsString()
  @IsNotEmpty()
  hostname: string;

  @IsString()
  @IsNotEmpty()
  value: string;

  @IsOptional()
  @IsIn(['ACTIVE', 'INACTIVE', 'SUSPENDED'])
  status?: string;
}
