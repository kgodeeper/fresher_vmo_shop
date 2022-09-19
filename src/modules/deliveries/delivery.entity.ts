import { Status } from '../../commons/enum.common';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Customer } from '../customers/customer.entity';

@Entity()
export class Delivery extends BaseEntity {
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

  @Column({
    type: 'enum',
    enum: Status,
    default: Status.ACTIVE,
  })
  status: Status;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'fkCustomer' })
  fkCustomer: Customer;

  @CreateDateColumn()
  createAt: Date;

  @UpdateDateColumn()
  updateAt: Date;

  @DeleteDateColumn()
  deleteAt: Date;

  updateInformation(
    phone?: string,
    receiver?: string,
    homeAddress?: string,
    district?: string,
    province?: string,
  ): void {
    this.phone = phone;
    this.receiver = receiver;
    this.homeAddress = homeAddress;
    this.district = district;
    this.province = province;
  }
}
