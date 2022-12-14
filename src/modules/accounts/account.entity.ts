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
import { encrypt } from 'src/utils/string.util';

@Entity()
export class Account extends BaseEntity {
  constructor(
    username: string,
    password: string,
    email: string,
    role?: accountRole,
    status?: accountStatus,
  ) {
    super();
    this.username = username;
    this.password = password;
    this.email = email;
    this.status = status;
    this.role = role;
  }
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
