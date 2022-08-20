import { Injectable } from '@nestjs/common';
import { encrypt } from 'src/utils/encrypt.util';
import { ServiceUtil } from 'src/utils/service.util';
import { DataSource, Repository } from 'typeorm';
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
}
