import { IsArray, ArrayMinSize, IsUUID } from 'class-validator';

export class BulkDeleteRoleDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  ids!: string[];
}
