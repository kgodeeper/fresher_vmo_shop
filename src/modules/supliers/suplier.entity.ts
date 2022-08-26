import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Suplier extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  pkSuplier: string;

  @Column()
  name: string;

  @Column()
  address: string;
}
