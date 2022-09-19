import {
  PrimaryGeneratedColumn,
  Column,
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  BeforeInsert,
  OneToMany,
  DeleteDateColumn,
} from 'typeorm';
import { Role, AccountStatus, LoginMethod } from '../../commons/enum.common';
import { encrypt } from '../..//utils/string.util';

@Entity()
export class Account extends BaseEntity {
  constructor(
    username: string,
    password: string,
    email: string,
    role?: Role,
    status?: AccountStatus,
    avatar?: string,
  ) {
    super();
    this.username = username;
    this.password = password;
    this.email = email;
    this.role = role;
    this.status = status;
    this.avatar = avatar;
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
    enum: LoginMethod,
    default: LoginMethod.BOTH,
  })
  loginMethod: LoginMethod;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.CUSTOMER,
  })
  role: Role;

  @Column({
    type: 'enum',
    enum: AccountStatus,
    default: AccountStatus.INACTIVE,
  })
  status: AccountStatus;

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

  @DeleteDateColumn()
  deletedAt: Date;

  @BeforeInsert()
  async encryptPassword() {
    this.password = await encrypt(this.password);
  }
}
