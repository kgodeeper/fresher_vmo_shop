import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Coupon } from '../coupons/coupon.entity';
import { CouponModule } from '../coupons/coupon.module';
import { Customer } from '../customers/customer.entity';

@Entity()
export class CustomerCoupon extends BaseEntity {
  constructor(coupon: Coupon, customer: Customer) {
    super();
    this.fkCoupon = coupon;
    this.fkCustomer = customer;
  }
  @PrimaryGeneratedColumn('uuid')
  pkCustomerCoupon: string;

  @Column({
    default: false,
  })
  used: boolean;

  @ManyToOne(() => Coupon)
  @JoinColumn({
    name: 'fkCoupon',
  })
  fkCoupon: Coupon;

  @ManyToOne(() => Customer)
  @JoinColumn({
    name: 'fkCustomer',
  })
  fkCustomer: Customer;
}
