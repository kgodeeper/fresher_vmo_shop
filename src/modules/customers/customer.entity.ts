import { Gender } from '../../commons/enum.common';
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Account } from '../accounts/account.entity';

@Entity()
export class Customer extends BaseEntity {
  constructor(
    fullname?: string,
    dob?: string,
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
    default: new Date(1, 1, 1990),
  })
  dob: string;

  @Column({
    nullable: true,
  })
  fullname: string;

  @Column({
    default: false,
  })
  receiveSale: boolean;

  @UpdateDateColumn({
    default: `now()`,
    nullable: true,
  })
  updateAt: string;

  @OneToOne(() => Account, (Account) => Account.pkAccount, {
    cascade: ['remove'],
  })
  @JoinColumn({
    name: 'fkAccount',
  })
  fkAccount: Account;

  updateInformation(fullname?: string, dob?: string, gender?: Gender) {
    this.fullname = fullname;
    this.dob = dob;
    this.gender = gender;
  }
}
