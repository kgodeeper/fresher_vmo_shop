import {
  PrimaryGeneratedColumn,
  Column,
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  BeforeInsert,
} from 'typeorm';
import { accountRole, accountStatus } from 'src/commons/enum.common';
import { encrypt } from 'src/utils/encrypt.util';

@Entity()
export class Account extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  pkAccount: string;

  @Column()
  username: string;

  @Column()
  password: string;

  @Column()
  email: string;

  @Column({
    type: 'enum',
    enum: accountRole,
    default: accountRole.CUSTOMER,
  })
  role: accountRole;

  @Column({
    type: 'enum',
    enum: accountStatus,
    default: accountStatus.INACTIVE,
  })
  status: accountStatus;

  @Column({
    nullable: true,
  })
  avatar: string;

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
