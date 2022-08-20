import { HttpException, Injectable } from '@nestjs/common';
import { encrypt } from 'src/utils/encrypt.util';
import { ServiceUtil } from 'src/utils/service.util';
import { DataSource, Repository } from 'typeorm';
import { RegisterValidator } from '../auths/auth.validator';
import { Account } from './account.entity';

@Injectable()
export class AccountService extends ServiceUtil<Account, Repository<Account>> {
  repository: Repository<Account>;
  constructor(private dataSource: DataSource) {
    super(dataSource.getRepository(Account));
  }

  async validatorAccount(account: string, password: string): Promise<Account> {
    password = await encrypt(password);
    const user = await this.repository
      .createQueryBuilder('user')
      .where(
        'password = :password and (username = :account or email = :account)',
        { account, password },
      )
      .getOne();
    return user;
  }

  async findUserByAccount(username: string, email: string): Promise<Account> {
    return this.findOneByCondition({ where: [{ username }, { email }] });
  }

  async createAccount(account: RegisterValidator): Promise<void> {
    await this.addRecord(
      new Account(account.username, account.password, account.email),
    );
  }
}
