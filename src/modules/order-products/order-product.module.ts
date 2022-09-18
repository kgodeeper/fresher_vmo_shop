import { Module } from '@nestjs/common';
import { OrderProductService } from './order-product.service';

@Module({
  imports: [],
  providers: [OrderProductService],
  exports: [OrderProductService],
})
export class OrderProductModule {}
