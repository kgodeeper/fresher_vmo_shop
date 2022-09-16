import { Module } from '@nestjs/common';
import { PaginationModule } from '../paginations/pagination.module';
import { CouponController } from './coupon.controller';
import { CouponService } from './coupon.service';

@Module({
  imports: [PaginationModule],
  exports: [CouponService],
  providers: [CouponService],
  controllers: [CouponController],
})
export class CouponModule {}
