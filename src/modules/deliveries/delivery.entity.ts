import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Customer } from '../customers/customer.entity';

@Entity()
export class DeliveryAddress extends BaseEntity {
  constructor(
    phone: string,
    receiver: string,
    homeAddress: string,
    district: string,
    province: string,
    customer: Customer,
  ) {
    super();
    this.phone = phone;
    this.receiver = receiver;
    this.homeAddress = homeAddress;
    this.district = district;
    this.province = province;
    this.fkCustomer = customer;
  }
  @PrimaryGeneratedColumn('uuid')
  pkAddress: string;

  @Column()
  phone: string;

  @Column()
  receiver: string;

  @Column()
  homeAddress: string;

  @Column()
  district: string;

  @Column()
  province: string;

  @OneToOne(() => Customer)
  @JoinColumn({ name: 'fkCustomer' })
  fkCustomer: Customer;
}
