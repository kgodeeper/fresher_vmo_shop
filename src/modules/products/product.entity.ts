import { commonStatus } from 'src/commons/enum.common';
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
import { Category } from '../categories/category.entity';
import { Suplier } from '../supliers/suplier.entity';

@Entity()
export class Product extends BaseEntity {
  constructor(
    name: string,
    barcode: string,
    importPrice: number,
    exportPrice: number,
    weight: number,
    description: string,
    category: Category,
    suplier: Suplier,
  ) {
    super();
    this.name = name;
    this.barcode = barcode;
    this.importPrice = importPrice;
    this.exportPrice = exportPrice;
    this.weight = weight;
    this.description = description;
    this.category = category;
    this.suplier = suplier;
  }
  @PrimaryGeneratedColumn('uuid')
  pkProduct: string;

  @Column()
  name: string;

  @Column()
  barcode: string;

  @Column({
    nullable: true,
  })
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
    enum: commonStatus,
    default: commonStatus.ACTIVE,
  })
  status: commonStatus;

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
  category: Category;

  @ManyToOne(() => Suplier)
  @JoinColumn({
    name: 'fkSuplier',
  })
  suplier: Suplier;
}
