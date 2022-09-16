import {
  OrderStatus,
  PaymentStatus,
  ShipmentStatus,
} from '../../commons/enum.common';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Customer } from '../customers/customer.entity';
import { OrderProduct } from '../order-products/order-product.entity';
import { Delivery } from '../deliveries/delivery.entity';
import { Coupon } from '../coupons/coupon.entity';
import { CustomerCoupon } from '../customer-coupons/customer-coupon.entity';
import { Payment } from '../payments/payment.entity';

@Entity()
export class Order extends BaseEntity {
  updateOrderInfo(
    totalPrice: number,
    finalPrice: number,
    shipmentPrice: number,
    customer: Customer,
    delivery: Delivery,
  ) {
    this.totalPrice = totalPrice;
    this.finalPrice = finalPrice;
    this.shipmentPrice = shipmentPrice;
    this.fkCustomer = customer;
    this.fkDelivery = delivery;
  }
  @PrimaryGeneratedColumn('uuid')
  pkOrder: string;

  @Column({
    nullable: true,
  })
  totalPrice: number;

  @Column({
    nullable: true,
  })
  finalPrice: number;

  @Column({
    nullable: true,
  })
  shipmentPrice: number;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  paymentStatus: PaymentStatus;

  @Column({
    type: 'enum',
    enum: ShipmentStatus,
    default: ShipmentStatus.PREPAIRING,
  })
  shipmentStatus: ShipmentStatus;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PROCESSING,
  })
  status: OrderStatus;

  @ManyToOne(() => Delivery)
  @JoinColumn({
    name: 'fkDelivery',
  })
  fkDelivery: Delivery;

  @OneToOne(() => Payment)
  @JoinColumn({
    name: 'fkPayment',
  })
  fkPayment: Payment;

  @OneToOne(() => CustomerCoupon)
  @JoinColumn({
    name: 'fkCoupon',
  })
  fkCustomerCoupon: CustomerCoupon;

  @ManyToOne(() => Customer)
  @JoinColumn({
    name: 'fkCustomer',
  })
  fkCustomer: Customer;

  @OneToMany(() => OrderProduct, (orderProduct) => orderProduct.fkOrder)
  products: OrderProduct[];

  @CreateDateColumn({
    default: 'now()',
  })
  createAt: string;

  @UpdateDateColumn({
    default: 'now()',
  })
  updateAt: string;
}
