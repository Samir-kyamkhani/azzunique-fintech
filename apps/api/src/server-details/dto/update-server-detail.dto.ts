// dto/update-server-detail.dto.ts
import { IsOptional, IsString } from 'class-validator';

export class UpdateServerDetailDto {
  @IsOptional()
  @IsString()
  recordType?: string;

  @IsOptional()
  @IsString()
  hostname?: string;

  @IsOptional()
  @IsString()
  value?: string;
}
