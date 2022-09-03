import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProductModel } from '../models/model.entity';
import { Order } from '../orders/order.entity';

@Entity()
export class OrderProduct extends BaseEntity {
  constructor(productModel: ProductModel, order: Order, quantity: number) {
    super();
    this.fkProductModel = productModel;
    this.fkOrder = order;
    this.quantity = quantity;
  }
  @PrimaryGeneratedColumn('uuid')
  pkOrderProduct: string;

  @Column({
    default: 9999,
  })
  priceAfterSale: number;

  @Column({
    default: 9999,
  })
  quantity: number;

  @Column({
    default: 9999,
  })
  totalPrice: number;

  @ManyToOne(() => ProductModel)
  @JoinColumn({
    name: 'fkProductModel',
  })
  fkProductModel: ProductModel;

  @ManyToOne(() => Order, (order) => order.products)
  @JoinColumn({
    name: 'fkOrder',
  })
  fkOrder: Order;
}
