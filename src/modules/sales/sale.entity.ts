import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Timestamp,
  UpdateDateColumn,
} from 'typeorm';
import { SaleProduct } from '../sale-products/sale-product.entity';

@Entity()
export class Sale extends BaseEntity {
  constructor(begin: Date, end: Date) {
    super();
    this.begin = begin;
    this.end = end;
  }
  @PrimaryGeneratedColumn('uuid')
  pkSale: string;

  @Column({
    type: 'timestamp',
    default: 'now()',
  })
  begin: Date;

  @Column({
    type: 'timestamp',
    default: 'now()',
  })
  end: Date;

  @CreateDateColumn({
    default: 'now()',
  })
  createAt: string;

  @UpdateDateColumn({
    default: 'now()',
  })
  updateAt: string;

  @OneToMany(() => SaleProduct, (product) => product.fkSale)
  products: SaleProduct[];
}
