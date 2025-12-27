import { Type } from 'class-transformer';
import { ValidateNested, ArrayMinSize } from 'class-validator';
import { CreateRoleDto } from './create-role.dto';

export class BulkCreateRoleDto {
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateRoleDto)
  roles: CreateRoleDto[];
}