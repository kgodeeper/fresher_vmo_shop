import {
  PrimaryGeneratedColumn,
  Column,
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
} from 'typeorm';
import { userRole, userStatus } from 'src/commons/enum.common';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  pkUser: string;

  @Column()
  username: string;

  @Column()
  password: string;

  @Column()
  email: string;

  @Column({ type: 'date' })
  dob: string;

  @Column({
    type: 'enum',
    enum: userRole,
    default: userRole.CUSTOMER,
  })
  role: userRole;

  @Column({
    type: 'enum',
    enum: userStatus,
    default: userStatus.INACTIVE,
  })
  status: userStatus;

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
