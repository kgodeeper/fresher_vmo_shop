import { HttpStatus, Injectable } from '@nestjs/common';
import { ServiceUtil } from '../../utils/service.utils';
import { DataSource, Repository } from 'typeorm';
import { Coupon } from './coupon.entity';
import { AddCouponDto } from './coupon.dto';
import { AppHttpException } from '../../exceptions/http.exception';

@Injectable()
export class CouponService extends ServiceUtil<Coupon, Repository<Coupon>> {
  constructor(private dataSource: DataSource) {
    super(dataSource.getRepository(Coupon));
  }

  async addCoupon(couponInfo: AddCouponDto): Promise<void> {
    const { code, discount, begin, end, total } = couponInfo;
    /**
     * check exist code
     */
    const existCoupon = await this.findOneByCondition({ code });
    if (existCoupon) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        'Coupon with this code already exist',
      );
    }
    /**
     * insert coupon
     */
    const coupon = new Coupon(
      code,
      Number(discount),
      begin,
      end,
      Number(total),
    );
    await this.repository.manager.save(coupon);
  }
}
