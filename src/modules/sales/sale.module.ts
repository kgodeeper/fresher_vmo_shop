import { Module } from '@nestjs/common';
import { SaleController } from './sale.controller';
import { SaleService } from './sale.service';

@Module({
  imports: [],
  exports: [SaleService],
  providers: [SaleService],
  controllers: [SaleController],
})
export class SaleModule {}
