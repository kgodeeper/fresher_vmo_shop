import { Module } from '@nestjs/common';
import { SaleService } from './sale.service';

@Module({
  imports: [],
  exports: [SaleService],
  providers: [SaleService],
  controllers: [],
})
export class SaleModule {}
