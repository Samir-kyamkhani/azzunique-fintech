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
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';

import { EmployeesService } from './employees.service';
import { GetEmployeesDto } from './dto/get-employees-dto';
import { CreateEmployeeDto } from './dto/create-employees.dto';
import { UpdateEmployeeDto } from './dto/update-employees.dto';
import { UpdateEmployeeStatusDto } from './dto/update-employee-status.dto';
import { UseAnyFilesInterceptor } from 'src/lib/decorators/upload-file.decorator';

@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  // // ==============================
  // // GET ALL (LIST + FILTERS)
  // // ==============================
  // @Get()
  // async getAll(@Query() query: GetEmployeesDto, @Req() req: Request) {
  //   const tenantId = req.user?.tenantId;

  //   if (!tenantId) {
  //     throw new BadRequestException('Tenant context missing');
  //   }

  //   return this.employeesService.getAll(query, { tenantId });
  // }

  // // ==============================
  // // GET ONE
  // // ==============================
  // @Get(':employeeId')
  // async getOne(@Param('employeeId') employeeId: string, @Req() req: Request) {
  //   const tenantId = req.user?.tenantId;

  //   if (!tenantId) {
  //     throw new BadRequestException('Tenant context missing');
  //   }

  //   return this.employeesService.findOne(employeeId, { tenantId });
  // }

  // // ==============================
  // // CREATE (WITH IMAGE)
  // // ==============================
  @Post()
  @UseAnyFilesInterceptor()
  async create(
    @Body() dto: CreateEmployeeDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: Request,
  ) {
    // const tenantId = req.user;
    const tenantId = '0aa43bfe-5bb0-4e71-aef4-4bc9d69e0bf2';

    if (!tenantId) {
      throw new BadRequestException('Tenant context missing');
    }

    const filePath = files?.[0]?.path; // first file, if exists

    return this.employeesService.create(dto, { tenantId }, filePath);
  }

  // // ==============================
  // // UPDATE (WITH IMAGE)
  // // ==============================
  // @Patch(':employeeId')
  // @UseInterceptors(FileInterceptor('profilePicture'))
  // async update(
  //   @Param('employeeId') employeeId: string,
  //   @Body() dto: UpdateEmployeeDto,
  //   @UploadedFile() file: Express.Multer.File,
  //   @Req() req: Request,
  // ) {
  //   const tenantId = req.user?.tenantId;

  //   if (!tenantId) {
  //     throw new BadRequestException('Tenant context missing');
  //   }

  //   return this.employeesService.update(
  //     employeeId,
  //     dto,
  //     { tenantId },
  //     file?.path,
  //   );
  // }

  // // ==============================
  // // UPDATE STATUS
  // // ==============================
  // @Patch(':employeeId/status')
  // async updateStatus(
  //   @Param('employeeId') employeeId: string,
  //   @Body() dto: UpdateEmployeeStatusDto,
  //   @Req() req: Request,
  // ) {
  //   const tenantId = req.user?.tenantId;

  //   if (!tenantId) {
  //     throw new BadRequestException('Tenant context missing');
  //   }

  //   return this.employeesService.updateStatus(employeeId, dto, { tenantId });
  // }

  // // ==============================
  // // DELETE
  // // ==============================
  // @Delete(':employeeId')
  // async delete(@Param('employeeId') employeeId: string, @Req() req: Request) {
  //   const tenantId = req.user?.tenantId;

  //   if (!tenantId) {
  //     throw new BadRequestException('Tenant context missing');
  //   }

  //   return this.employeesService.delete(employeeId, { tenantId });
  // }
}
