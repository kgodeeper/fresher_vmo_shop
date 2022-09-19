import { forwardRef, Module } from '@nestjs/common';
import { OrderModule } from '../orders/order.module';
import { OrderService } from '../orders/order.service';
import { ProductModule } from '../products/product.module';
import { ProductModelController } from './model.controller';
import { ProductModelService } from './model.service';

@Module({
  imports: [forwardRef(() => ProductModule), forwardRef(() => OrderModule)],
  exports: [ProductModelService],
  providers: [ProductModelService],
  controllers: [ProductModelController],
})
export class ProductModelModule {}
