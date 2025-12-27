import { Module } from '@nestjs/common';
import { UsersPermissionsService } from './users-permissions.service';
import { UsersPermissionsController } from './users-permissions.controller';

@Module({
  controllers: [UsersPermissionsController],
  providers: [UsersPermissionsService],
})
export class UsersPermissionsModule {}
