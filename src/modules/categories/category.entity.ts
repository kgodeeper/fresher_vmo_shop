import { categoryStatus } from 'src/commons/enum.common';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Category extends BaseEntity {
  constructor(name: string, banner: string, status?: categoryStatus) {
    super();
    this.name = name;
    this.banner = banner;
    this.status = status;
  }
  @PrimaryGeneratedColumn('uuid')
  pkCategory: string;

  @Column()
  name: string;

  @Column()
  banner: string;

  @Column({
    type: 'enum',
    enum: categoryStatus,
    default: categoryStatus.ACTIVE,
  })
  status: categoryStatus;

  @CreateDateColumn({
    default: `now()`,
  })
  createAt: string;

  @UpdateDateColumn({
    default: `now()`,
  })
  updateAt: string;
}
