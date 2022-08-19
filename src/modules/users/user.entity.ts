import {
  PrimaryGeneratedColumn,
  Column,
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  BeforeInsert,
} from 'typeorm';
import { userRole, userStatus } from 'src/commons/enum.common';
import { encrypt } from 'src/utils/encrypt.util';

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

  @Column({ type: 'date', nullable: true })
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

  @BeforeInsert()
  async encyptPassword() {
    this.password = await encrypt(this.password);
  }
}
