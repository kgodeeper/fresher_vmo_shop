import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { accountStatus } from 'src/commons/enum.common';
import { generateCode } from 'src/utils/string.util';
import { encrypt } from 'src/utils/string.util';
import { ServiceUtil } from 'src/utils/service.util';
import { DataSource, Repository } from 'typeorm';
import { RegisterValidator } from '../auths/auth.validator';
import { RedisCacheService } from '../caches/cache.service';
import { JWTService } from '../jwts/jwt.service';
import { MailService } from '../mailer/mailer.service';
import { Account } from './account.entity';
import { VerifyValidator } from './account.validator';

@Injectable()
export class AccountService extends ServiceUtil<Account, Repository<Account>> {
  repository: Repository<Account>;
  constructor(
    private dataSource: DataSource,
    private jwtService: JWTService,
    private mailService: MailService,
    private configService: ConfigService,
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

  async resendVerifyEmail(email: string): Promise<void> {
    const user = await this.findOneByCondition({ where: { email } });
    if (!user)
      throw new HttpException('Email is not exist', HttpStatus.BAD_REQUEST);
    if (user.status !== accountStatus.INACTIVE)
      throw new HttpException(
        `Account already ${user.status}`,
        HttpStatus.BAD_REQUEST,
      );
    this.sendVerifyEmail(email);
  }

  async sendVerifyEmail(email: string): Promise<void> {
    const code = generateCode();
    await this.cacheService.set(
      email,
      code,
      this.configService.get<number>('TTLVERIFY'),
    );
    this.mailService.sendVerifyEmail(email, code);
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.findOneByCondition({
      where: { email, status: accountStatus.ACTIVE },
    });
    if (!user)
      throw new HttpException('Email is not exist', HttpStatus.BAD_REQUEST);
    const verifyCode = generateCode();
    this.mailService.sendForgotPasswordCode(email, verifyCode);
    this.cacheService.set(
      email,
      verifyCode,
      this.configService.get<number>('CONFIRMTTL'),
    );
  }

  async confirmForgotPassword(email: string, code: string) {
    const verifyCode = await this.cacheService.get(email);
    if (!verifyCode)
      throw new HttpException(
        'Verify code for this email is not exist',
        HttpStatus.BAD_REQUEST,
      );
    if (verifyCode !== code)
      throw new HttpException(
        'Verify code is not correct',
        HttpStatus.BAD_REQUEST,
      );
    await this.cacheService.delete(email);
    const confirmToken = this.jwtService.generateToken(
      { email },
      { expiresIn: this.configService.get<number>('CONFIRMTOKENEXPIRES') },
    );
    const signature = (await confirmToken).split('.');
    await this.cacheService.set(
      signature.at(-1),
      email,
      this.configService.get<number>('TOKENTTL'),
    );
    return confirmToken;
  }

  async changePasswordByToken({ password, presentToken }) {
    const signature = (await presentToken).split('.');
    const email = await this.cacheService.get(signature.at(-1));
    if (!email)
      throw new HttpException(
        'Dont have change password require',
        HttpStatus.BAD_REQUEST,
      );
    const user = await this.findOneByCondition({
      where: { email, status: accountStatus.ACTIVE },
    });

    if (!user)
      throw new HttpException('User is not exist', HttpStatus.BAD_REQUEST);
    user.password = await encrypt(password);
    user.save();
    this.cacheService.delete(signature.at(-1));
  }
}
