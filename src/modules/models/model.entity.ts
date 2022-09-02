import { Status } from '../../commons/enum.common';
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Product } from '../products/product.entity';

@Entity()
export class ProductModel extends BaseEntity {
  constructor(
    memory: string,
    screen: string,
    os: string,
    color: string,
    quantityInStock: number,
    battery: string,
    fkProduct: Product,
  ) {
    super();
    this.memory = memory;
    this.screen = screen;
    this.os = os;
    this.color = color;
    this.quantityInStock = quantityInStock;
    this.battery = battery;
    this.fkProduct = fkProduct;
  }

  @PrimaryGeneratedColumn('uuid')
  pkProductModel: string;

  @Column()
  memory: string;

  @Column()
  screen: string;

  @Column()
  os: string;

  @Column()
  color: string;

  @Column()
  quantityInStock: number;

  @Column()
  battery: string;

  @Column({
    type: 'enum',
    enum: Status,
    default: Status.ACTIVE,
  })
  status: Status;

  @ManyToOne(() => Product, (product) => product.models)
  @JoinColumn({
    name: 'fkProduct',
  })
  fkProduct: Product;
}
