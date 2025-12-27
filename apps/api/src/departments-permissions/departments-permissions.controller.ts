import { Controller } from '@nestjs/common';
import { DepartmentsPermissionsService } from './departments-permissions.service';

@Controller('departments-permissions')
export class DepartmentsPermissionsController {
  constructor(private readonly departmentsPermissionsService: DepartmentsPermissionsService) {}
}
