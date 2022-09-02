import { Status } from '../../commons/enum.common';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Category } from '../categories/category.entity';
import { Suplier } from '../supliers/suplier.entity';
import { Photo } from '../photos/photo.entity';
import { ProductModel } from '../models/model.entity';
import { Sale } from '../sales/sale.entity';
import { SaleProduct } from '../sale-products/sale-product.entity';

@Entity()
export class Product extends BaseEntity {
  constructor(
    category: Category,
    suplier: Suplier,
    name: string,
    barcode: string,
    avatar: string,
    importPrice: number,
    exportPrice: number,
    weight?: number,
    description?: string,
  ) {
    super();
    this.fkCategory = category;
    this.fkSuplier = suplier;
    this.name = name;
    this.barcode = barcode;
    this.avatar = avatar;
    this.importPrice = importPrice;
    this.exportPrice = exportPrice;
    this.weight = weight;
    this.description = description;
  }
  @PrimaryGeneratedColumn('uuid')
  pkProduct: string;

  @Column()
  name: string;

  @Column()
  barcode: string;

  @Column()
  avatar: string;

  @Column()
  importPrice: number;

  @Column()
  exportPrice: number;

  @Column({
    nullable: true,
  })
  weight: number;

  @Column({
    nullable: true,
  })
  description: string;

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

  @ManyToOne(() => Category)
  @JoinColumn({
    name: 'fkCategory',
  })
  fkCategory: Category;

  @ManyToOne(() => Suplier)
  @JoinColumn({
    name: 'fkSuplier',
  })
  fkSuplier: Suplier;

  @OneToMany(() => Photo, (photo) => photo.fkProduct)
  photos: Photo[];

  @OneToMany(() => ProductModel, (model) => model.fkProduct)
  models: ProductModel[];

  @OneToMany(() => SaleProduct, (saleProduct) => saleProduct.fkProduct)
  sales: SaleProduct[];

  updateInformation(
    name?: string,
    barcode?: string,
    avatar?: string,
    importPrice?: string,
    exportPrice?: string,
    weight?: string,
    description?: string,
    suplier?: Suplier,
    category?: Category,
  ) {
    this.name = name;
    this.barcode = barcode;
    this.avatar = avatar;
    this.importPrice = Number(importPrice);
    this.exportPrice = Number(exportPrice);
    this.weight = Number(weight);
    this.description = description;
    this.fkSuplier = suplier;
    this.fkCategory = category;
  }
}
