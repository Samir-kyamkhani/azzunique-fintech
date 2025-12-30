// dto/update-server-status.dto.ts
import { IsIn } from 'class-validator';

export class UpdateServerStatusDto {
  @IsIn(['ACTIVE', 'INACTIVE', 'SUSPENDED'])
  status!: string;
}
