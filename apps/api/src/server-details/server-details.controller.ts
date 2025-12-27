import {
  // Body,
  Controller,
  // Param,
  // Patch,
  // Post,
  // Req,
  // BadRequestException,
} from '@nestjs/common';
// import { Request } from 'express';

import { ServerDetailsService } from './server-details.service';
// import { CreateServerDetailDto } from './dto/create-server-detail.dto';
// import { UpdateServerDetailDto } from './dto/update-server-detail.dto';
// import { UpdateServerStatusDto } from './dto/update-server-status.dto';

// 🔧 TEMP helpers (same pattern as other controllers)
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

@Controller('server-details')
export class ServerDetailsController {
  constructor(private readonly serverDetailsService: ServerDetailsService) {}

  // // ==============================
  // // CREATE
  // // ==============================
  // @Post()
  // async create(@Body() dto: CreateServerDetailDto, @Req() req: Request) {
  //   const actor = getActorOrThrow(req);

  //   return this.serverDetailsService.create(dto, actor, getReqMeta(req));
  // }

  // // ==============================
  // // UPDATE
  // // ==============================
  // @Patch(':serverId')
  // async update(
  //   @Param('serverId') serverId: string,
  //   @Body() dto: UpdateServerDetailDto,
  //   @Req() req: Request,
  // ) {
  //   getActorOrThrow(req); // auth check only

  //   return this.serverDetailsService.update(serverId, dto);
  // }

  // // ==============================
  // // UPDATE STATUS
  // // ==============================
  // @Patch(':serverId/status')
  // async updateStatus(
  //   @Param('serverId') serverId: string,
  //   @Body() dto: UpdateServerStatusDto,
  //   @Req() req: Request,
  // ) {
  //   getActorOrThrow(req); // auth check only

  //   return this.serverDetailsService.updateStatus(serverId, dto);
  // }
}
