import {
  HttpException,
  HttpStatus,
  Inject,
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
    @Inject(RedisCacheService)
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
      const username = user.username;
      const accessToken = await this.jwtService.generateToken(
        { username: user.username },
        { expiresIn: this.configService.get<string>('ACCESSTOKENEXPIRES') },
      );
      let refreshToken = await this.cacheService.get(
        `users:${username}:refreshToken`,
      );
      if (!refreshToken) {
        refreshToken = await this.jwtService.generateToken(
          { username },
          {
            expiresIn: this.configService.get<string>('REFRESHTOKENEXPIRES'),
          },
        );
        /**
         * cache refresh token
         */
        await this.cacheService.set(
          `users:${username}:refreshToken`,
          refreshToken,
          this.configService.get<number>('TTLCACHE'),
        );
      }
      /**
       * cache role
       */
      await this.cacheService.set(
        `users:${username}:${sessionId}:${splitString(accessToken, '.', -1)}`,
        user.role,
        this.configService.get<number>('ACCESSTOKENTTL'),
      );
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

  async newToken(refreshToken, sessionId): Promise<object> {
    if (!sessionId)
      throw new HttpException('Invalid session', HttpStatus.BAD_REQUEST);
    const { username } = await this.jwtService.verifyToken(refreshToken);
    const cacheRefreshToken = await this.cacheService.get(
      `users:${username}:refreshToken`,
    );
    if (cacheRefreshToken !== refreshToken)
      throw new HttpException('Invalid refresh token', HttpStatus.BAD_REQUEST);
    const accessToken = await this.jwtService.generateToken(
      { username },
      { expiresIn: this.configService.get<string>('ACCESSTOKENEXPIRES') },
    );
    const user = await this.accountService.getAccountByUsername(username);
    const keys = await this.cacheService.keys(
      `users:${username}:${sessionId}:*`,
    );
    for (let i = 0; i < keys.length; i++) {
      await this.cacheService.delete(keys[i]);
    }
    await this.cacheService.set(
      `users:${username}:${sessionId}:${splitString(accessToken, '.', -1)}`,
      user.role,
      this.configService.get<number>('ACCESSTOKENTTL'),
    );
    return { accessToken };
  }
}
