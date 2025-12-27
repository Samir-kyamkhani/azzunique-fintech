import { IsString } from 'class-validator';

export class AuditLogDeleteDto {
  @IsString()
  id: string;
}
