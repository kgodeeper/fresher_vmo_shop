import { Status } from '../../commons/enum.common';
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
  constructor(
    name?: string,
    banner?: string,
    status?: Status,
    position?: number,
  ) {
    super();
    this.name = name;
    this.banner = banner;
    this.status = status;
    this.position = position;
  }
  @PrimaryGeneratedColumn('uuid')
  pkCategory: string;

  @Column()
  name: string;

  @Column()
  banner: string;

  @Column({
    type: 'enum',
    enum: Status,
    default: Status.ACTIVE,
  })
  status: Status;

  @Column()
  position: number;

  @CreateDateColumn({
    default: `now()`,
    nullable: false,
  })
  createAt: string;

  @UpdateDateColumn({
    default: `now()`,
    nullable: true,
  })
  updateAt: string;
}
