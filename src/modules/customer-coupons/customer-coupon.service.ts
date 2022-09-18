import { HttpStatus, Injectable } from '@nestjs/common';
import { ServiceUtil } from '../../utils/service.utils';
import { DataSource, Repository } from 'typeorm';
import { AccountService } from '../accounts/account.service';
import { CustomerService } from '../customers/customer.service';
import { CustomerCoupon } from './customer-coupon.entity';
import { CouponService } from '../coupons/coupon.service';
import { AppHttpException } from '../../exceptions/http.exception';
import { Customer } from '../customers/customer.entity';
import { Gender, Status } from '../../commons/enum.common';
import {
  getAllForceOptions,
  getAllJoinOptions,
  IPagination,
} from 'src/utils/interface.util';
import {
  combineFilter,
  combineRange,
  combineSearch,
  combineSort,
} from '../../utils/string.util';
import { PaginationService } from '../paginations/pagination.service';

@Injectable()
export class CustomerCouponService extends ServiceUtil<
  CustomerCoupon,
  Repository<CustomerCoupon>
> {
  constructor(
    private dataSource: DataSource,
    private couponSerivice: CouponService,
    private accountService: AccountService,
    private paginationService: PaginationService<CustomerCoupon>,
    private customerService: CustomerService,
  ) {
    super(dataSource.getRepository(CustomerCoupon));
  }

  async saveCoupon(code: string, username: string): Promise<void> {
    const existAccount = await this.accountService.getActiveAccountName(
      username,
    );
    let existCustomer = await this.customerService.getCustomerByAccount(
      existAccount.pkAccount,
    );
    if (!existCustomer) {
      existCustomer = new Customer('', undefined, Gender.MALE, existAccount);
      await this.customerService.saveCustomer(existCustomer);
    }
    const existCoupon = await this.couponSerivice.findOneByCondition([
      { code },
    ]);
    if (!existCoupon) {
      throw new AppHttpException(HttpStatus.BAD_REQUEST, 'Coupon is not exist');
    }
    /**
     * check coupon quantity
     * check coupon expires
     */
    if (existCoupon.remain <= 0) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        'The number of this coupon is 0',
      );
    }
    if (new Date(existCoupon.end) < new Date()) {
      throw new AppHttpException(HttpStatus.BAD_REQUEST, 'Coupon is expires');
    }
    /**
     * check coupon saved
     */
    const existSaved = await this.findOneByCondition({
      fkCoupon: { pkCoupon: existCoupon.pkCoupon },
      fkCustomer: { pkCustomer: existCustomer.pkCustomer },
    });
    if (existSaved) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        'This coupon already save before',
      );
    }
    await this.dataSource.transaction(async (entityManager) => {
      await entityManager.save(new CustomerCoupon(existCoupon, existCustomer));
      existCoupon.remain = existCoupon.remain - 1;
      await entityManager.save(existCoupon);
    });
  }

  async getCustomerCouponById(id: string): Promise<CustomerCoupon> {
    const existCoupon = await this.findOneAndJoin(
      { fkCoupon: true },
      { pkCustomerCoupon: id },
    );
    if (!existCoupon) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        'Your coupon is not exist',
      );
    }
    return existCoupon;
  }

  async getCoupons(
    page: number,
    pLimit: string,
    search: string,
    sort: string,
    filter: string,
    username: string,
  ): Promise<IPagination<CustomerCoupon>> {
    const existCustomer = await this.customerService.getCustomerByUsername(
      username,
    );
    if (filter) {
      filter += `;fkCustomer:${existCustomer.pkCustomer}`;
    } else {
      filter = `fkCustomer:${existCustomer.pkCustomer}`;
    }
    if (page <= 0) page = 1;
    let limit = 25;
    if (Number(pLimit) !== NaN && Number(pLimit) >= 0) limit = Number(pLimit);
    const force: getAllForceOptions = {
      forces: [
        {
          column: 'status',
          condition: Status.ACTIVE,
        },
      ],
    };
    const join: getAllJoinOptions = {
      rootName: 'customer_coupon',
      joinColumns: [
        {
          column: 'customer_coupon.fkCoupon',
          optional: 'coupon',
        },
      ],
    };
    let totals = [];
    try {
      totals = await this.getAlls(search, sort, filter, force, join);
    } catch (error) {
      console.log(error);
    }
    const total = totals.length;
    const elements = totals.splice((page - 1) * limit, page * limit);
    this.paginationService.setPrefix('customer-coupons/own');
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
