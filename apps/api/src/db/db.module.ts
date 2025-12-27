import { Module } from '@nestjs/common';
import { CoreDbService } from './core/drizzle';

@Module({
  providers: [CoreDbService],
  exports: [CoreDbService],
})
export class DbModule {}
