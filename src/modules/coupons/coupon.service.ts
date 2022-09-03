import { HttpStatus, Injectable } from '@nestjs/common';
import { ServiceUtil } from '../../utils/service.utils';
import { DataSource, Repository } from 'typeorm';
import { Coupon } from './coupon.entity';
import { AddCouponDto } from './coupon.dto';
import { AppHttpException } from '../../exceptions/http.exception';
import { Status } from '../../commons/enum.common';
import { MAX_ELEMENTS_OF_PAGE } from '../../commons/const.common';
import { getTotalPages } from '../../utils/number.util';
import { IPaginate } from '../../utils/interface.util';

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

  async removeCoupon(id: string): Promise<void> {
    const existCoupon = await this.getExistCoupon(id);
    existCoupon.status = Status.INACTIVE;
    await existCoupon.save();
  }

  async getExistCoupon(id: string): Promise<Coupon> {
    const existCoupon = await this.findOneByCondition({ pkCoupon: id });
    if (!existCoupon) {
      throw new AppHttpException(HttpStatus.BAD_REQUEST, 'Coupon is not exist');
    }
    if (existCoupon.status === Status.INACTIVE) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        'Coupon already remove',
      );
    }
    if (new Date(existCoupon.end) < new Date()) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        'Coupon is out of date',
      );
    }
    return existCoupon;
  }

  async getAllCoupons(page: number): Promise<IPaginate<Coupon>> {
    if (page <= 0) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        'Page number is invalid',
      );
    }
    const totalCoupons = await this.repository.findAndCount({});
    if ((page - 1) * MAX_ELEMENTS_OF_PAGE >= totalCoupons[1]) {
      throw new AppHttpException(HttpStatus.BAD_REQUEST, 'Out of range');
    }
    const elements = totalCoupons[0].slice(
      (page - 1) * MAX_ELEMENTS_OF_PAGE,
      page * MAX_ELEMENTS_OF_PAGE + 1,
    );
    return {
      page,
      totalPages: getTotalPages(totalCoupons[1]),
      totalElements: totalCoupons[1],
      elements,
    };
  }

  async getAllActiveCoupon(page: number): Promise<IPaginate<Coupon>> {
    if (page <= 0) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        'Page number is invalid',
      );
    }
    const totalCoupons = await this.repository
      .createQueryBuilder()
      .where('"status" = :status AND "end" > now()', { status: Status.ACTIVE })
      .getMany();
    if ((page - 1) * MAX_ELEMENTS_OF_PAGE >= totalCoupons.length) {
      throw new AppHttpException(HttpStatus.BAD_REQUEST, 'Out of range');
    }
    const elements = totalCoupons.slice(
      (page - 1) * MAX_ELEMENTS_OF_PAGE,
      page * MAX_ELEMENTS_OF_PAGE + 1,
    );
    return {
      page,
      totalPages: getTotalPages(totalCoupons.length),
      totalElements: totalCoupons.length,
      elements,
    };
  }

  async getCouponByCode(code: string): Promise<Coupon> {
    return this.repository
      .createQueryBuilder()
      .where('"end" > now() AND code = :code OR "pkCoupon" = :code', { code })
      .getOne();
  }
}
