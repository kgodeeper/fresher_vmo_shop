import { commonStatus } from 'src/commons/enum.common';
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
  constructor(name: string, banner: string, status?: commonStatus) {
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
}
