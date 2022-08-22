import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { AccountService } from '../accounts/account.service';
import { ConfigService } from '@nestjs/config';
import { RedisCacheService } from '../caches/cache.service';
import { RegisterValidator } from './auth.validator';
import { accountStatus } from 'src/commons/enum.common';
import { JWTService } from '../jwts/jwt.service';
import { splitString } from 'src/utils/string.util';

@Injectable()
export class AuthService {
  constructor(
    private accountService: AccountService,
    private configService: ConfigService,
    private jwtService: JWTService,
    private cacheService: RedisCacheService,
  ) {}
  async validatorUser(
    account: string,
    password: string,
    sessionId: string,
  ): Promise<object> {
    const user = await this.accountService.validatorAccount(account, password);
    if (!user)
      throw new HttpException('Account is not exist', HttpStatus.BAD_REQUEST);
    if (user.status !== accountStatus.ACTIVE)
      throw new HttpException(
        `Account is ${user.status}`,
        HttpStatus.BAD_REQUEST,
      );
    try {
      const email = user.email;
      const accessToken = await this.jwtService.generateToken(
        { account },
        { expiresIn: this.configService.get<string>('ACCESSTOKENEXPIRES') },
      );
      let refreshToken = await this.cacheService.get(
        `users:${email}:refreshToken`,
      );
      if (!refreshToken) {
        refreshToken = await this.jwtService.generateToken(
          { account },
          {
            expiresIn: this.configService.get<string>('REFRESHTOKENEXPIRES'),
          },
        );
        /**
         * cache access token
         */
        await this.cacheService.set(
          `users:${email}:${sessionId}:accessToken`,
          splitString(accessToken, '.', -1),
          this.configService.get<number>('ACCESSTOKENTTL'),
        );
        /**
         * cache refresh token
         */
        await this.cacheService.set(
          `users:${email}:refreshToken`,
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
