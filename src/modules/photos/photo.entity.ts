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
export class Photo extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  pkPicture: string;

  @Column()
  path: string;

  @ManyToOne(() => Product)
  @JoinColumn({
    name: 'fkProduct',
  })
  fkProduct: Product;
}
