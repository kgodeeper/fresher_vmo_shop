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
export class Picture extends BaseEntity {
  constructor(url: string, product: Product) {
    super();
    this.url = url;
    this.product = product;
  }

  @PrimaryGeneratedColumn('uuid')
  pkPicture: string;

  @Column()
  url: string;

  @ManyToOne(() => Product)
  @JoinColumn({
    name: 'fkProduct',
  })
  product: Product;
}
