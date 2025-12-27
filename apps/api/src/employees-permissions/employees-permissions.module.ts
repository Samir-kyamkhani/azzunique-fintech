import { Module } from '@nestjs/common';
import { EmployeesPermissionsService } from './employees-permissions.service';
import { EmployeesPermissionsController } from './employees-permissions.controller';

@Module({
  controllers: [EmployeesPermissionsController],
  providers: [EmployeesPermissionsService],
})
export class EmployeesPermissionsModule {}
