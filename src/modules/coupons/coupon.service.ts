import { HttpStatus, Injectable } from '@nestjs/common';
import { ServiceUtil } from '../../utils/service.utils';
import { DataSource, Repository } from 'typeorm';
import { Coupon } from './coupon.entity';
import { AddCouponDto } from './coupon.dto';
import { AppHttpException } from '../../exceptions/http.exception';
import { Status } from '../../commons/enum.common';
import { MAX_ELEMENTS_OF_PAGE } from '../../commons/const.common';
import { getTotalPages } from '../../utils/number.util';
import { IPaginate, IPagination } from '../../utils/interface.util';
import {
  combineFilter,
  combineSearch,
  combineSort,
} from '../../utils/string.util';
import { PaginationService } from '../paginations/pagination.service';

@Injectable()
export class CouponService extends ServiceUtil<Coupon, Repository<Coupon>> {
  constructor(
    private dataSource: DataSource,
    private paginationService: PaginationService<Coupon>,
  ) {
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
      new Date(begin),
      new Date(end),
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
      .where('"end" > now() AND code = :code', { code })
      .getOne();
  }

  async getCurrentCoupon(
    page: number,
    pLimit: string,
    search: string,
    sort: string,
    filter: string,
  ): Promise<IPagination<Coupon>> {
    if (page <= 0) page = 1;
    let limit = 25;
    if (Number(pLimit) !== NaN && Number(pLimit) >= 0) limit = Number(pLimit);
    const force = {
      key: 'status',
      value: 'active',
    };
    const sortStr = combineSort(sort);
    const filterStr = combineFilter(filter, force);
    const searchStr = combineSearch(search);
    let totals = [];
    try {
      totals = await this.getAlls(
        searchStr,
        sortStr,
        filterStr,
        force,
        undefined,
        undefined,
        ' now() BETWEEN "begin" AND "end"',
      );
    } catch (error) {
      console.log(error);
    }
    const total = totals.length;
    const elements = totals.splice((page - 1) * limit, page * limit);
    this.paginationService.setPrefix('categories/active');
    return this.paginationService.getResponseObject(
      elements,
      total,
      page,
      limit,
      search,
      sort,
      filter,
      null,
    );
  }
}
