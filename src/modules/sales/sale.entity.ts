import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Sale extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  pkSale: string;

  @Column({
    type: 'timestamp',
    default: 'now()',
  })
  begin: string;

  @Column({
    type: 'timestamp',
    default: 'now()',
  })
  end: string;

  @CreateDateColumn({
    default: 'now()',
  })
  createAt: string;

  @UpdateDateColumn({
    default: 'now()',
  })
  updateAt: string;
}
