import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';

import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { UpdateTenantStatusDto } from './dto/update-tenant-status.dto';
import { GetTenantsDto } from './dto/get-tenants.dto';

@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  // ==============================
  // GET ALL
  // ==============================
  @Get()
  async getAll(@Query() query: GetTenantsDto, @Req() req: Request) {
    // const actor = getActorOrThrow(req);

    // return this.tenantsService.getAll(query, {
    //   tenantId: actor.tenantId,
    // });
    return this.tenantsService.getAll(query);
  }

  // ==============================
  // CREATE
  // ==============================
  @Post('create')
  async create(@Body() dto: CreateTenantDto, @Req() req: Request) {
    // const actor = getActorOrThrow(req);

    // return this.tenantsService.create(dto, actor, getReqMeta(req));
    return this.tenantsService.create(dto);
  }

  // ==============================
  // UPDATE
  // ==============================
  @Patch(':tenantId')
  async update(
    @Param('tenantId') tenantId: string,
    @Body() dto: UpdateTenantDto,
    @Req() req: Request,
  ) {
    // const actor = getActorOrThrow(req);

    // return this.tenantsService.update(tenantId, dto, actor, getReqMeta(req));
    return this.tenantsService.update(tenantId, dto);
  }

  // ==============================
  // UPDATE STATUS
  // ==============================
  @Patch(':tenantId/status')
  async updateStatus(
    @Param('tenantId') tenantId: string,
    @Body() dto: UpdateTenantStatusDto,
    @Req() req: Request,
  ) {
    // const actor = getActorOrThrow(req);

    return this.tenantsService.updateStatus(
      tenantId,
      dto,
      // actor,
      // getReqMeta(req),
    );
  }

  // ==============================
  // DELETE
  // ==============================
  @Delete(':tenantId')
  async delete(@Param('tenantId') tenantId: string, @Req() req: Request) {
    // const actor = getActorOrThrow(req);

    // return this.tenantsService.delete(tenantId, actor, getReqMeta(req));
    return this.tenantsService.delete(tenantId);
  }

  @Get(':tenantId')
  getOne(@Param('tenantId') tenantId: string) {
    return this.tenantsService.findOne(tenantId);
  }
}

// function getActorOrThrow(req: Request) {
//   const user = req.user;

//   if (!user?.tenantId) {
//     throw new BadRequestException('Tenant context missing');
//   }

//   return {
//     userId: user.id,
//     employeeId: user.employeeId,
//     tenantId: user.tenantId,
//     role: user.role,
//     department: user.department,
//   };
// }

// function getReqMeta(req: Request) {
//   return {
//     ipAddress: req.ip,
//     userAgent: req.headers['user-agent'],
//   };
// }
