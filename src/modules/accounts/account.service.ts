import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { accountStatus } from 'src/commons/enum.common';
import { encrypt } from 'src/utils/encrypt.util';
import { ServiceUtil } from 'src/utils/service.util';
import { DataSource, Repository } from 'typeorm';
import { RegisterValidator } from '../auths/auth.validator';
import { RedisCacheService } from '../caches/cache.service';
import { Account } from './account.entity';
import { VerifyValidator } from './account.validtor';

@Injectable()
export class AccountService extends ServiceUtil<Account, Repository<Account>> {
  repository: Repository<Account>;
  constructor(
    private dataSource: DataSource,
    private cacheService: RedisCacheService,
  ) {
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

  async activeAccount(activeInfo: VerifyValidator): Promise<void> {
    const verifyCode = await this.cacheService.get(activeInfo.email);
    if (verifyCode) {
      const account = await this.findOneByCondition({
        where: [{ email: activeInfo.email }],
      });
      if (account) {
        if (verifyCode === activeInfo.verifyCode) {
          account.status = accountStatus.ACTIVE;
          account.save();
          await this.cacheService.delete(activeInfo.email);
        } else {
          throw new HttpException(
            'Verify code is not correct',
            HttpStatus.BAD_REQUEST,
          );
        }
      } else {
        throw new HttpException(
          'Account with this email is not exist',
          HttpStatus.BAD_REQUEST,
        );
      }
    } else {
      throw new HttpException(
        'Verify code for this email is not exist',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
