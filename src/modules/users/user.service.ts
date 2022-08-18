import { Injectable } from '@nestjs/common';
import { ServiceUtil } from 'src/utils/service.util';
import { DataSource, Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UserService extends ServiceUtil<User, Repository<User>> {
  constructor(private dataSource: DataSource) {
    super(dataSource.getRepository(User));
  }
}
