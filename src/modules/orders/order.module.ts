import { Module } from '@nestjs/common';
import { CouponModule } from '../coupons/coupon.module';
import { CustomerModule } from '../customers/customer.module';
import { DeliveryModule } from '../deliveries/delivery.module';
import { ProductModelModule } from '../models/model.module';
import { ProductModule } from '../products/product.module';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';

@Module({
  imports: [
    ProductModelModule,
    CustomerModule,
    CouponModule,
    DeliveryModule,
    ProductModule,
  ],
  exports: [OrderService],
  providers: [OrderService],
  controllers: [OrderController],
})
export class OrderModule {}
