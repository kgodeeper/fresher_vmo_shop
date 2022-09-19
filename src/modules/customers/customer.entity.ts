import { Gender } from '../../commons/enum.common';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Account } from '../accounts/account.entity';
import { Order } from '../orders/order.entity';

@Entity()
export class Customer extends BaseEntity {
  constructor(
    fullname?: string,
    dob?: Date,
    gender?: Gender,
    Account?: Account,
  ) {
    super();
    this.fullname = fullname;
    this.dob = dob;
    this.gender = gender;
    this.fkAccount = Account;
  }
  @PrimaryGeneratedColumn('uuid')
  pkCustomer: string;

  @Column({
    type: 'enum',
    enum: Gender,
    default: Gender.MALE,
  })
  gender: string;

  @Column({
    type: 'date',
    default: new Date(2000, 1, 1),
  })
  dob: Date;

  @Column({
    nullable: true,
  })
  fullname: string;

  @Column({
    default: false,
  })
  receiveSale: boolean;

  @OneToMany(() => Order, (order) => order.fkCustomer)
  orders: Order[];

  @UpdateDateColumn({
    default: `now()`,
    nullable: true,
  })
  updateAt: Date;

  @CreateDateColumn()
  createAt: Date;

  @DeleteDateColumn()
  deleteAt: Date;

  @OneToOne(() => Account, (Account) => Account.pkAccount, {
    cascade: ['remove'],
  })
  @JoinColumn({
    name: 'fkAccount',
  })
  fkAccount: Account;

  updateInformation(fullname?: string, dob?: Date, gender?: Gender) {
    this.fullname = fullname;
    this.dob = dob;
    this.gender = gender;
  }
}
