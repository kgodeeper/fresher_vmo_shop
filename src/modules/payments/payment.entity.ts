import { PaymentStatus } from '../../commons/enum.common';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Order } from '../orders/order.entity';

@Entity()
export class Payment extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  pkPayment: string;

  @Column({
    nullable: true,
  })
  payId: string;

  @Column({
    nullable: true,
  })
  payerId: string;

  @Column()
  ammount: number;

  @OneToOne(() => Order)
  @JoinColumn({
    name: 'fkOrder',
  })
  fkOrder: Order;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @CreateDateColumn({
    default: `now()`,
  })
  createAt: string;

  @UpdateDateColumn({
    default: `now()`,
  })
  updateAt: string;
}
