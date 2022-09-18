import { Status } from '../../commons/enum.common';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Product } from '../products/product.entity';

@Entity()
export class ProductModel extends BaseEntity {
  constructor(
    memory: string,
    color: string,
    quantityInStock: number,
    fkProduct: Product,
  ) {
    super();
    this.memory = memory;
    this.color = color;
    this.quantityInStock = quantityInStock;
    this.fkProduct = fkProduct;
  }

  @PrimaryGeneratedColumn('uuid')
  pkProductModel: string;

  @Column()
  memory: string;

  @Column()
  color: string;

  @Column()
  quantityInStock: number;

  @Column({
    type: 'enum',
    enum: Status,
    default: Status.ACTIVE,
  })
  status: Status;

  @CreateDateColumn({
    default: `now()`,
  })
  createAt: string;

  @UpdateDateColumn({
    default: `now()`,
  })
  updateAt: string;

  @ManyToOne(() => Product, (product) => product.models)
  @JoinColumn({
    name: 'fkProduct',
  })
  fkProduct: Product;

  updateModel(color?: string, memory?: string, quantityInStock?: number) {
    this.color = color;
    this.quantityInStock = quantityInStock;
    this.memory = memory;
  }
}
