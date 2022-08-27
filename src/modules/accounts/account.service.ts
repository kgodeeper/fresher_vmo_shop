import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { accountRole, accountStatus } from 'src/commons/enum.common';
import { generateCode, randomString } from 'src/utils/string.util';
import { encrypt } from 'src/utils/string.util';
import { ServiceUtil } from 'src/utils/service.util';
import { DataSource, Repository } from 'typeorm';
import { RegisterDto } from '../auths/auth.dto';
import { RedisCacheService } from '../caches/cache.service';
import { JWTService } from '../jwts/jwt.service';
import { MailService } from '../mailer/mailer.service';
import { Account } from './account.entity';
import { VerifyDto } from './account.dto';
import { Request } from 'express';
import { AppHttpException } from '../exceptions/http.exceptions';
import { Paginate } from 'src/utils/interface.util';
import { getPageNumber } from 'src/utils/number.util';
import { NUMBER_OF_PAGE_ELEMENT } from 'src/utils/const.util';

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

  async createAccount(account: RegisterDto): Promise<void> {
    await this.addRecord(
      new Account(account.username, account.password, account.email),
    );
    this.cacheService.changeValue(
      this.configService.get<string>('ACCOUNT_ALL_KEY'),
      1,
      Infinity,
    );
  }

  async activeAccount(activeInfo: VerifyDto): Promise<void> {
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
          throw new AppHttpException(
            HttpStatus.BAD_REQUEST,
            'Verify code is not correct',
          );
        }
      } else {
        throw new AppHttpException(
          HttpStatus.BAD_REQUEST,
          'Account with this email is not exist',
        );
      }
    } else {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        'Verify code for this email is not exist',
      );
    }
  }

  async resendVerifyEmail(email: string): Promise<void> {
    const user = await this.findOneByCondition({ where: { email } });
    if (!user)
      throw new AppHttpException(HttpStatus.BAD_REQUEST, 'Email is not exist');
    if (user.status !== accountStatus.INACTIVE)
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        `Account already ${user.status}`,
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
      throw new AppHttpException(HttpStatus.BAD_REQUEST, 'Email is not exist');
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
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        'Verify code for this email is not exist',
      );
    if (verifyCode !== code)
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        'Verify code is not correct',
      );
    await this.cacheService.delete(email);
    const confirmToken = await this.jwtService.generateToken(
      { email },
      { expiresIn: this.configService.get<number>('CONFIRMTOKENEXPIRES') },
    );
    const signature = (await confirmToken).split('.');
    await this.cacheService.set(
      signature.at(-1),
      email,
      this.configService.get<number>('TOKENTTL'),
    );
    return { confirmToken };
  }

  async changePasswordByToken({ password, presentToken }) {
    const signature = (await presentToken).split('.');
    const email = await this.cacheService.get(signature.at(-1));
    if (!email)
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        'Dont have change password require',
      );
    const userAccount = await this.findOneByCondition({
      where: { email, status: accountStatus.ACTIVE },
    });

    if (!userAccount)
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        'Account with this email is not active or exist',
      );
    userAccount.password = await encrypt(password);
    userAccount.save();
    this.cacheService.delete(signature.at(-1));
  }

  async getAccountByUsername(username): Promise<Account> {
    return await this.findOneByCondition({ where: { username } });
  }

  async changePassword(
    changeInfo: {
      oldPassword: string;
      newPassword: string;
    },
    username: string,
    request: Request,
  ): Promise<any> {
    let { oldPassword, newPassword } = changeInfo;
    if (oldPassword === newPassword)
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        'Old password can not be equals new password',
      );
    const userAccount = await this.getAccountByUsername(username);
    if (!userAccount)
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        'Account with this id is not exist',
      );
    oldPassword = await encrypt(oldPassword);
    newPassword = await encrypt(newPassword);
    if (userAccount.password !== oldPassword)
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        'Your old password is not correct',
      );
    userAccount.password = newPassword;
    await userAccount.save();
    const keys = await this.cacheService.keys(
      `users:${userAccount.username}:*`,
    );
    for (let i = 0; i < keys.length; i++) {
      await this.cacheService.delete(keys[i]);
    }
    request.session.destroy(() => {
      return;
    });
  }

  async getAll(page: number): Promise<Paginate<Account>> {
    if (page <= 0) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        'Page number is out of range',
      );
    }
    let totalElements = 0;
    totalElements = Number(
      await this.cacheService.get(
        this.configService.get<string>('ACCOUNT_ALL_KEY'),
      ),
    );
    const totalPages = getPageNumber(totalElements);
    const accounts = await this.repository
      .createQueryBuilder('account')
      .offset((page - 1) * NUMBER_OF_PAGE_ELEMENT)
      .limit(NUMBER_OF_PAGE_ELEMENT)
      .getMany();
    if (accounts.length === 0) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        'Page number is out of range',
      );
    }
    return {
      page,
      totalPages,
      totalElements,
      elements: accounts,
    };
  }

  async blockAccount(account, currentUser): Promise<any> {
    const userAccount = await this.findOneByCondition({
      where: { pkAccount: account },
    });
    if (!userAccount)
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        'Account with this id is not exist',
      );
    if (userAccount.username === currentUser)
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        'Unable to block yourself',
      );
    if (userAccount.status === accountStatus.BLOCKED) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        'This account is already blocked',
      );
    }
    userAccount.status = accountStatus.BLOCKED;
    await userAccount.save();
  }

  async openAccount(account): Promise<any> {
    const userAccount = await this.findOneByCondition({
      where: { pkAccount: account },
    });
    if (userAccount.status !== accountStatus.BLOCKED) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        'Thia account is already opened',
      );
    }
    userAccount.status = accountStatus.ACTIVE;
    await userAccount.save();
  }

  async addAccount(
    accountInfo,
  ): Promise<{ username: string; password: string }> {
    const { email, role } = accountInfo;
    const userAccount = await this.findOneByCondition({ where: { email } });
    if (userAccount)
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        'Account with this email already exist',
      );
    const newAccount = new Account(
      randomString(6),
      randomString(8),
      email,
      role,
      accountStatus.ACTIVE,
    );
    const publicPassword = newAccount.password;
    await this.repository.insert(newAccount);
    this.mailService.sendCreateEmail(
      email,
      newAccount.username,
      publicPassword,
    );
    await this.cacheService.changeValue(
      this.configService.get<string>('ACCOUNT_ALL_KEY'),
      1,
      Infinity,
    );
    return {
      username: newAccount.username,
      password: publicPassword,
    };
  }

  async changeRole(
    account: string,
    role: accountRole,
    currentUser: string,
  ): Promise<void> {
    const userAccount = await this.findOneByCondition({
      where: { pkAccount: account },
    });
    if (!userAccount)
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        'Account with id is not exist',
      );
    if (userAccount.username === currentUser)
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        'Can not change role of yourself',
      );
    userAccount.role = role;
    await userAccount.save();
    const keys = await this.cacheService.keys(
      `users:${userAccount.username}:*`,
    );
    for (let i = 0; i < keys.length; i++) {
      await this.cacheService.delete(keys[i]);
    }
  }
}
