import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { AppHttpException } from '../../exceptions/http.exception';
import { LoginDto, RegisterDto } from '../auths/auth.dto';
import { AccountService } from '../accounts/account.service';
import { Account } from '../accounts/account.entity';
import { RedisCacheService } from '../caches/cache.service';
import { MailService } from '../mailer/mail.service';
import { encrypt, splitString } from '../../utils/string.util';
import { ConfigService } from '@nestjs/config';
import { AppJwtService } from '../jwts/jwt.service';
import { AccountStatus } from '../../commons/enum.common';

@Injectable()
export class AuthService {
  constructor(
    private accountService: AccountService,
    private configService: ConfigService,
    private jwtService: AppJwtService,
    private cacheService: RedisCacheService,
    private mailService: MailService,
  ) {}

  async userRegister(account: RegisterDto) {
    /**
     * check account already exists
     */
    const existAccount = await this.accountService.findOneByCondition([
      { username: account.username },
      { email: account.email },
    ]);
    if (existAccount) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        'Account with username or email already exist',
      );
    }
    /**
     * if not exists account in database, insert account into database
     * before insert, we need convert RegisterDto to Account
     */
    account = new Account(account.username, account.password, account.email);
    await this.accountService.createAccount(account as Account);
    /**
     * after insert success, update cache number of account for get accounts
     */
    await this.cacheService.updateQuantityValue('shop:all:accounts', 1);
    /**
     * then, send verify email for new customer, we need generate random verify code
     * we save verify code in redis cache to compare with verify code of customer
     */
    await this.accountService.sendVerifyEmail(account.username, account.email);
  }

  async userLogin(
    account: LoginDto,
    session: any,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    /**
     * check account with account and password exist ?
     */
    account.password = await encrypt(account.password);
    const existAccount = await this.accountService.findOneByCondition([
      { username: account.account },
      { email: account.account },
    ]);
    if (!existAccount) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        'Account is not exist',
      );
    }
    if (existAccount.password !== account.password) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        'Password is incorrect',
      );
    }
    if (existAccount.status !== AccountStatus.ACTIVE) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        `Account was ${existAccount.status}`,
      );
    }
    /**
     * if login success, generate accessToken
     * Generate sessionId if not exist then bind access token with session for revoke token (save into redis cache)
     * Cache role
     * if refreshToken token already cached, get it and return, else generate new refreshToken and cache it
     */
    const accessToken = await this.jwtService.signToken(
      { username: existAccount.username },
      this.configService.get<number>('ACCESS_EXPIRES'),
    );

    if (!session.sessionId) {
      session.sessionId =
        Math.floor(Math.random() * 1000) + '' + Number(new Date());
    }
    this.cacheService.set(
      `user:${existAccount.username}:accessToken:${session.sessionId}`,
      splitString(accessToken, '.', -1),
      this.configService.get<number>('ACCESS_TTL'),
    );

    await this.cacheService.set(
      `user:${existAccount.username}:role`,
      existAccount.role,
      this.configService.get<number>('INFINITY_TTL'),
    );

    const refreshKey = `user:${existAccount.username}:refreshToken`;
    let refreshToken = await this.cacheService.get(refreshKey);
    if (!refreshToken) {
      refreshToken = await this.jwtService.signToken(
        { username: existAccount.username },
        this.configService.get<number>('REFRESH_EXPIRES'),
      );
      await this.cacheService.set(
        refreshKey,
        refreshToken,
        this.configService.get<number>('REFRESH_TTL'),
      );
    }
    return {
      accessToken,
      refreshToken,
    };
  }

  async getAccessToken(
    refreshToken: string,
    session: any,
  ): Promise<{ accessToken: string }> {
    try {
      /**
       * check session, if session is not exist, create new one
       * verify user refresh token
       * compare with cached refresh token
       * if pass, update accessToken in redis cache
       * return new accessToken
       */
      if (!session.sessionId) {
        session.sessionId =
          Math.floor(Math.random() * 1000) + '' + Number(new Date());
      }
      const { username } = await this.jwtService.verifyToken(refreshToken);
      const cachedRefreshToken = await this.cacheService.get(
        `user:${username}:refreshToken`,
      );
      if (cachedRefreshToken !== refreshToken) {
        throw new AppHttpException(
          HttpStatus.BAD_REQUEST,
          'Token is not match',
        );
      }
      const accessToken = await this.jwtService.signToken(
        { username },
        this.configService.get<number>('ACCESS_EXPIRES'),
      );
      this.cacheService.set(
        `user:${username}:accessToken:${session.sessionId}`,
        splitString(accessToken, '.', -1),
        this.configService.get<number>('ACCESS_TTL'),
      );
      return { accessToken };
    } catch (error) {
      if (error instanceof AppHttpException) throw error;
      throw new AppHttpException(HttpStatus.BAD_REQUEST, 'Invalid token');
    }
  }
}
