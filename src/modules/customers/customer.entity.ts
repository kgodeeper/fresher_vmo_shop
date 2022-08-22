import { customerGender } from 'src/commons/enum.common';
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
    gender?: customerGender,
    avatar?: string,
    fkAccount?: string,
  ) {
    super();
    this.fullname = fullname;
    this.dob = dob;
    this.gender = gender;
    this.avatar = avatar;
    this.fkAccount = fkAccount;
  }
  @PrimaryGeneratedColumn('uuid')
  pkCustomer: string;

  @Column({
    type: 'enum',
    enum: customerGender,
    default: customerGender.MALE,
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
    nullable: true,
  })
  avatar: string;

  @UpdateDateColumn({
    default: `now()`,
    nullable: true,
  })
  updateAt: string;

  @OneToOne(() => Account)
  @JoinColumn({
    name: 'fkAccount',
  })
  fkAccount: string;

  updateInformation(
    fullname?: string,
    dob?: string,
    gender?: customerGender,
    avatar?: string,
  ) {
    this.fullname = fullname;
    this.dob = dob;
    this.gender = gender;
    this.avatar = avatar;
  }
}
