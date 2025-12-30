import { Module } from '@nestjs/common';
import { AuthUtilsService } from './auth-utils';
import { S3UtilsService } from './s3-utils';

@Module({
  providers: [AuthUtilsService, S3UtilsService],
  exports: [AuthUtilsService, S3UtilsService],
})
export class UtilsModule {}
