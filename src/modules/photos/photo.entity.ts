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
export class Photo extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  pkPicture: string;

  @Column()
  path: string;

  @CreateDateColumn()
  createAt: Date;

  @UpdateDateColumn()
  updateAt: Date;

  @ManyToOne(() => Product, (product) => product.photos)
  @JoinColumn({
    name: 'fkProduct',
  })
  fkProduct: Product;
}
