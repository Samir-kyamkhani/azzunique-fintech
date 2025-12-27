import { Controller } from '@nestjs/common';
import { EmployeesPermissionsService } from './employees-permissions.service';

@Controller('employees-permissions')
export class EmployeesPermissionsController {
  constructor(private readonly employeesPermissionsService: EmployeesPermissionsService) {}
}
