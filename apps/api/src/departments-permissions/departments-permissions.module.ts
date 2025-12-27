import { Module } from '@nestjs/common';
import { DepartmentsPermissionsService } from './departments-permissions.service';
import { DepartmentsPermissionsController } from './departments-permissions.controller';

@Module({
  controllers: [DepartmentsPermissionsController],
  providers: [DepartmentsPermissionsService],
})
export class DepartmentsPermissionsModule {}
