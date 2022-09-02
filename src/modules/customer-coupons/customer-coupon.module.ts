import { Module } from '@nestjs/common';
import { AccountModule } from '../accounts/account.module';
import { CouponModule } from '../coupons/coupon.module';
import { CustomerModule } from '../customers/customer.module';
import { CustomerCouponController } from './customer-coupon.controller';
import { CustomerCouponService } from './customer-coupon.service';

@Module({
  imports: [CustomerModule, AccountModule, CouponModule],
  exports: [CustomerCouponService],
  providers: [CustomerCouponService],
  controllers: [CustomerCouponController],
})
export class CustomerCouponModule {}
