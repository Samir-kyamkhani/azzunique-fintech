import { Controller } from '@nestjs/common';
import { UsersPermissionsService } from './users-permissions.service';

@Controller('users-permissions')
export class UsersPermissionsController {
  constructor(private readonly usersPermissionsService: UsersPermissionsService) {}
}
