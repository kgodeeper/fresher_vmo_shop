import { Module } from '@nestjs/common';
import { PaginationModule } from '../paginations/pagination.module';
import { SaleController } from './sale.controller';
import { SaleService } from './sale.service';

@Module({
  imports: [PaginationModule],
  exports: [SaleService],
  providers: [SaleService],
  controllers: [SaleController],
})
export class SaleModule {}
