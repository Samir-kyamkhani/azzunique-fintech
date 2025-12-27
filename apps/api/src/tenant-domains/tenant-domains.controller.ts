import {
  // BadRequestException,
  // Body,
  Controller,
  // Get,
  // Param,
  // Patch,
  // Post,
  // Query,
  // Req,
} from '@nestjs/common';
import { Request } from 'express';

import { TenantDomainsService } from './tenant-domains.service';

// import { CreateTenantDomainDto } from './dto/create-tenant-domain.dto';
// import { UpdateTenantDomainDto } from './dto/update-tenant-domain.dto';
// import { UpdateTenantDomainStatusDto } from './dto/update-tenant-domain-status.dto';
// import { GetTenantDomainsDto } from './dto/get-tenant-domains.dto';

@Controller('tenant-domains')
export class TenantDomainsController {
  constructor(private readonly tenantDomainsService: TenantDomainsService) {}

  // // ==============================
  // // GET ALL
  // // ==============================
  // @Get()
  // async getAll(@Query() query: GetTenantDomainsDto, @Req() req: Request) {
  //   const actor = getActorOrThrow(req);

  //   return this.tenantDomainsService.getAll(query, {
  //     tenantId: actor.tenantId,
  //   });
  // }

  // // ==============================
  // // CREATE
  // // ==============================
  // @Post('/create')
  // async create(@Body() dto: CreateTenantDomainDto, @Req() req: Request) {
  //   const actor = getActorOrThrow(req);

  //   return this.tenantDomainsService.create(dto, actor, getReqMeta(req));
  // }

  // // ==============================
  // // UPDATE
  // // ==============================
  // @Patch(':domainId')
  // async update(
  //   @Param('domainId') domainId: string,
  //   @Body() dto: UpdateTenantDomainDto,
  //   @Req() req: Request,
  // ) {
  //   const actor = getActorOrThrow(req);

  //   return this.tenantDomainsService.update(
  //     domainId,
  //     dto,
  //     actor,
  //     getReqMeta(req),
  //   );
  // }

  // // ==============================
  // // UPDATE STATUS
  // // ==============================
  // @Patch(':domainId/status')
  // async updateStatus(
  //   @Param('domainId') domainId: string,
  //   @Body() dto: UpdateTenantDomainStatusDto,
  //   @Req() req: Request,
  // ) {
  //   const actor = getActorOrThrow(req);

  //   return this.tenantDomainsService.updateStatus(
  //     domainId,
  //     dto,
  //     actor,
  //     getReqMeta(req),
  //   );
  // }
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
