import { Status } from '../../commons/enum.common';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Coupon extends BaseEntity {
  constructor(
    code: string,
    discount: number,
    begin: Date,
    end: Date,
    total: number,
  ) {
    super();
    this.code = code;
    this.discount = discount;
    this.begin = begin;
    this.end = end;
    this.total = total;
    this.remain = total;
  }
  @PrimaryGeneratedColumn('uuid')
  pkCoupon: string;

  @Column()
  code: string;

  @Column()
  discount: number;

  @Column({
    type: 'date',
    default: 'now()',
  })
  begin: Date;

  @Column({
    type: 'date',
    default: 'now()',
  })
  end: Date;

  @Column({
    default: 'No description',
  })
  description: string;

  @Column()
  total: number;

  @Column()
  remain: number;

  @Column({
    type: 'enum',
    enum: Status,
    default: Status.ACTIVE,
  })
  status: Status;

  @CreateDateColumn()
  createAt: string;

  @UpdateDateColumn()
  updateAt: string;
}
