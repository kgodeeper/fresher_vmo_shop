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
    nullable: true,
  })
  priceAfterSale: number;

  @Column()
  priceBeforeSale: number;

  @Column()
  quantity: number;

  @Column({
    nullable: true,
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
