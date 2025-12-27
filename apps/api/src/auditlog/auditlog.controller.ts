import { Controller, Get, Delete, Param, Query } from '@nestjs/common';
import { AuditlogService } from './auditlog.service';
import { AuditLogQueryDto } from './dto/auditlog-query.dto';

@Controller('auditlog')
export class AuditlogController {
  constructor(private readonly auditlogService: AuditlogService) {}

  // GET ALL
  @Get()
  getAll(@Query() query: AuditLogQueryDto) {
    return this.auditlogService.getAll(query);
  }

  // GET ONE
  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.auditlogService.getById(id);
  }

  // DELETE
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.auditlogService.delete(id);
  }
}
