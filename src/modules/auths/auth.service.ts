import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { AccountService } from '../accounts/account.service';
import { ConfigService } from '@nestjs/config';
import { RedisCacheService } from '../caches/cache.service';
import { RegisterDto } from './auth.dto';
import { accountStatus } from 'src/commons/enum.common';
import { JWTService } from '../jwts/jwt.service';
import { splitString } from 'src/utils/string.util';
import { AppHttpException } from '../exceptions/http.exceptions';

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
    const userAccount = await this.accountService.validatorAccount(
      account,
      password,
    );
    if (!userAccount) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        'Account with username , password is not exist',
      );
    }
    if (userAccount.status !== accountStatus.ACTIVE) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        `This account was ${userAccount.status}`,
      );
    }
    const { username, role } = userAccount;
    let refreshToken = await this.cacheService.get(
      `users:${username}:refreshToken`,
    );
    const accessToken = await this.jwtService.generateToken(
      { username },
      { expiresIn: this.configService.get<string>('ACCESSTOKENEXPIRES') },
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
      role,
      this.configService.get<number>('ACCESSTOKENTTL'),
    );
    return { accessToken, refreshToken };
  }

  async registerUser(account: RegisterDto): Promise<any> {
    const userAccount = await this.accountService.findUserByAccount(
      account.username,
      account.email,
    );
    if (!userAccount) {
      await this.accountService.createAccount(account);
      this.accountService.sendVerifyEmail(account.email);
    } else {
      if (userAccount.username === account.username) {
        throw new AppHttpException(
          HttpStatus.BAD_REQUEST,
          'Account with username already exist',
        );
      } else
        throw new AppHttpException(
          HttpStatus.BAD_REQUEST,
          'Account with email elready exist',
        );
    }
  }

  async getNewToken(refreshToken, sessionId): Promise<object> {
    if (!sessionId) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        'Your session is invalid',
      );
    }
    try {
      const { username } = await this.jwtService.verifyToken(refreshToken);
      const cachedRefreshToken = await this.cacheService.get(
        `users:${username}:refreshToken`,
      );
      if (cachedRefreshToken !== refreshToken) {
        throw new AppHttpException(
          HttpStatus.BAD_REQUEST,
          'Refresh token is invalid',
        );
      }
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
    } catch {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        'Your refresh token is not valid',
      );
    }
  }
}
