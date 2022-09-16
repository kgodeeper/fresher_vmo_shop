import { HttpStatus, Injectable } from '@nestjs/common';
import { ServiceUtil } from '../../utils/service.utils';
import { DataSource, Repository } from 'typeorm';
import { AccountService } from '../accounts/account.service';
import { CustomerService } from '../customers/customer.service';
import { CustomerCoupon } from './customer-coupon.entity';
import { CouponService } from '../coupons/coupon.service';
import { AppHttpException } from '../../exceptions/http.exception';
import { Customer } from '../customers/customer.entity';
import { Gender } from '../../commons/enum.common';

@Injectable()
export class CustomerCouponService extends ServiceUtil<
  CustomerCoupon,
  Repository<CustomerCoupon>
> {
  constructor(
    private dataSource: DataSource,
    private couponSerivice: CouponService,
    private accountService: AccountService,
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
}
