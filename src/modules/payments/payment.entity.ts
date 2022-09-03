import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Payment extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  pkPayment: string;

  @Column()
  ammount: number;
}
