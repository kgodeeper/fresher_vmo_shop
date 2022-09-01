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

  @ManyToOne(() => Product, (product) => product.photos)
  @JoinColumn({
    name: 'fkProduct',
  })
  fkProduct: Product;
}
