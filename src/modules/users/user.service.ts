import { Injectable } from '@nestjs/common';
import { encrypt } from 'src/utils/encrypt.util';
import { ServiceUtil } from 'src/utils/service.util';
import { DataSource, Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UserService extends ServiceUtil<User, Repository<User>> {
  repository: Repository<User>;
  constructor(private dataSource: DataSource) {
    super(dataSource.getRepository(User));
  }

  async checkUserExist(account: string, password: string): Promise<boolean> {
    password = await encrypt(password);
    const user = await this.repository
      .createQueryBuilder('user')
      .where(
        'password = :password and (username = :account or email = :account)',
        { account, password },
      )
      .getOne();
    if (user) return true;
    return false;
  }
}
