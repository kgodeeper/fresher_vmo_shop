import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { AccountService } from '../accounts/account.service';
import { ConfigService } from '@nestjs/config';
import { RedisCacheService } from '../caches/cache.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterValidator } from './auth.validator';
import { accountStatus } from 'src/commons/enum.common';

@Injectable()
export class AuthService {
  constructor(
    private accountService: AccountService,
    private configService: ConfigService,
    private jwtService: JwtService,
    private cacheService: RedisCacheService,
  ) {}
  async validatorUser(account: string, password: string): Promise<object> {
    const user = await this.accountService.validatorAccount(account, password);
    if (!user)
      throw new HttpException('Account is not exist', HttpStatus.BAD_REQUEST);
    if (user.status !== accountStatus.ACTIVE)
      throw new HttpException(
        `Account is ${user.status}`,
        HttpStatus.BAD_REQUEST,
      );
    try {
      const pkUser = user.pkAccount.toString();
      const accessToken = await this.jwtService.signAsync(
        { account },
        { expiresIn: this.configService.get<string>('ACCESSTOKENEXPIRES') },
      );
      let refreshToken = await this.cacheService.get(pkUser);
      if (!refreshToken) {
        refreshToken = await this.jwtService.signAsync(
          { account },
          {
            expiresIn: this.configService.get<string>('REFRESHTOKENEXPIRES'),
          },
        );
        await this.cacheService.set(
          pkUser,
          refreshToken,
          this.configService.get<number>('TTLCACHE'),
        );
      }
      return { accessToken, refreshToken };
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async registerUser(account: RegisterValidator): Promise<any> {
    const user = await this.accountService.findUserByAccount(
      account.username,
      account.email,
    );
    if (!user) {
      await this.accountService.createAccount(account);
      this.accountService.sendVerifyEmail(account.email);
    } else {
      if (user.username === account.username)
        throw new HttpException(
          'Username already exist',
          HttpStatus.BAD_REQUEST,
        );
      else
        throw new HttpException('Email already exist', HttpStatus.BAD_REQUEST);
    }
  }
}
