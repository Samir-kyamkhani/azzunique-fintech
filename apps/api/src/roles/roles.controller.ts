import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';

import { RolesService } from './roles.service';
import { CreateRoleDto } from './dtos/create-role.dto';
import { UpdateRoleDto } from './dtos/update-role.dto';
import { BulkCreateRoleDto } from './dtos/bulk-create-role.dto';
import { BulkDeleteRoleDto } from './dtos/bulk-delete-role.dto';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateRoleDto) {
    return this.rolesService.create(dto);
  }

  @Get()
  async findAll() {
    return this.rolesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  @Get('code/:roleCode')
  async findByRoleCode(@Param('roleCode') roleCode: string) {
    return this.rolesService.findByRoleCode(roleCode);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.rolesService.update(id, dto);
  }

  @Post('bulk-create')
  @HttpCode(HttpStatus.CREATED)
  async bulkCreate(@Body() dto: BulkCreateRoleDto) {
    return this.rolesService.bulkCreate(dto.roles);
  }

  @Delete('bulk-delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  async bulkDelete(@Body() dto: BulkDeleteRoleDto) {
    await this.rolesService.bulkDelete(dto.ids);
    return null;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.rolesService.remove(id);
    return null;
  }
}
