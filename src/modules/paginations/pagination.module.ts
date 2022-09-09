import { Module } from '@nestjs/common';
import { PaginationService } from './pagination.service';

@Module({
  imports: [],
  exports: [PaginationService],
  providers: [PaginationService],
})
export class PaginationModule {}
