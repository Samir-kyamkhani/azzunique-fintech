import {
  // Body,
  Controller,
  // Delete,
  // Get,
  // Param,
  // Patch,
  // Post,
  // Query,
  // Req,
  // BadRequestException,
} from '@nestjs/common';
// import { Request } from 'express';

// import { DepartmentsService } from './departments.service';
// import { CreateDepartmentDto } from './dto/create-department.dto';
// import { UpdateDepartmentDto } from './dto/update-department.dto';
// import { GetDepartmentsDto } from './dto/get-departments.dto';

// // ==============================
// // TEMP HELPERS (same pattern everywhere)
// // ==============================
// function getActorOrThrow(req: Request) {
//   const user: any = req.user;

//   if (!user?.tenantId) {
//     throw new BadRequestException('Tenant context missing');
//   }

//   return {
//     tenantId: user.tenantId,
//     userId: user.id,
//     employeeId: user.employeeId,
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

@Controller('departments')
export class DepartmentsController {
  // constructor(private readonly departmentsService: DepartmentsService) {}
  // // ==============================
  // // GET ALL (PAGINATED + FILTER)
  // // ==============================
  // @Get()
  // async getAll(@Query() query: GetDepartmentsDto, @Req() req: Request) {
  //   const actor = getActorOrThrow(req);
  //   return this.departmentsService.getAll(query, {
  //     tenantId: actor.tenantId,
  //   });
  // }
  // // ==============================
  // // CREATE
  // // ==============================
  // @Post()
  // async create(@Body() dto: CreateDepartmentDto, @Req() req: Request) {
  //   const actor = getActorOrThrow(req);
  //   return this.departmentsService.create(dto, actor, getReqMeta(req));
  // }
  // // ==============================
  // // UPDATE
  // // ==============================
  // @Patch(':departmentId')
  // async update(
  //   @Param('departmentId') departmentId: string,
  //   @Body() dto: UpdateDepartmentDto,
  //   @Req() req: Request,
  // ) {
  //   const actor = getActorOrThrow(req);
  //   return this.departmentsService.update(
  //     departmentId,
  //     dto,
  //     actor,
  //     getReqMeta(req),
  //   );
  // }
  // // ==============================
  // // DELETE
  // // ==============================
  // @Delete(':departmentId')
  // async delete(
  //   @Param('departmentId') departmentId: string,
  //   @Req() req: Request,
  // ) {
  //   const actor = getActorOrThrow(req);
  //   return this.departmentsService.delete(departmentId, actor, getReqMeta(req));
  // }
}
