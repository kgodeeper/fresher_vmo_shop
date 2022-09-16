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
import { Sale } from '../sales/sale.entity';
import { Product } from '../products/product.entity';

@Entity()
export class SaleProduct extends BaseEntity {
  constructor(sale: Sale, product: Product, total: number, discount: number) {
    super();
    this.fkSale = sale;
    this.fkProduct = product;
    this.totalQuantity = total;
    this.remainQuantity = total;
    this.discount = discount;
  }
  @PrimaryGeneratedColumn('uuid')
  pkSaleProduct: string;

  @ManyToOne(() => Sale, (sale) => sale.products)
  @JoinColumn({
    name: 'fkSale',
  })
  fkSale: Sale;

  @ManyToOne(() => Product, (product) => product.sales)
  @JoinColumn({
    name: 'fkProduct',
  })
  fkProduct: Product;

  @Column()
  totalQuantity: number;

  @Column()
  remainQuantity: number;

  @Column({
    default: 0,
  })
  discount: number;

  @Column({
    default: 0,
  })
  salePrice: number;

  @CreateDateColumn({
    default: 'now()',
  })
  createAt: string;

  @UpdateDateColumn({
    default: 'now()',
  })
  updateAt: string;
}
