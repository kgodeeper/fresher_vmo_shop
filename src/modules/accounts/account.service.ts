import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { RedisCacheService } from '../caches/cache.service';
import { ServiceUtil } from '../../utils/service.utils';
import { Account } from './account.entity';
import { AccountStatus, Role, Status } from '../../commons/enum.common';
import { AppHttpException } from '../../exceptions/http.exception';
import { EmailDto } from 'src/commons/dto.common';
import { MailService } from '../mailer/mail.service';
import {
  encrypt,
  generateCode,
  getPublicId,
  randomString,
} from '../../utils/string.util';
import { ConfigService } from '@nestjs/config';
import {
  ChangeEmailDto,
  ChangeEmailRequireDto,
  ChangePasswordDto,
  ForgotPasswordDto,
} from './account.dto';
import { UploadService } from '../uploads/upload.service';
import { IPaginate } from '../../utils/interface.util';
import { MAX_ELEMENTS_OF_PAGE } from '../../commons/const.common';
import { getTotalPages } from '../../utils/number.util';

@Injectable()
export class AccountService extends ServiceUtil<Account, Repository<Account>> {
  protected repository;
  constructor(
    private dataSource: DataSource,
    private mailService: MailService,
    private configService: ConfigService,
    private cacheService: RedisCacheService,
    private uploadService: UploadService,
  ) {
    super(dataSource.getRepository(Account));
  }

  async createAccount(account: Account) {
    return account.save();
  }

  async activeAccount(verifyInfo: {
    email: string;
    code: string;
  }): Promise<void> {
    const { email, code } = verifyInfo;
    const existAccount = await this.findOneByCondition({ email });
    /**
     * if account status is not inactive, throw error
     */
    if (existAccount.status !== AccountStatus.INACTIVE) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        `Account was ${existAccount.status}`,
      );
    }
    /**
     * get verify code in redis
     * if account is exist, compare code with code in redis
     * if code is match, active account and remove cache
     * else throw error
     */
    const verifyKey = `email:${existAccount.email}:verifyCode`;
    const verifyCode = await this.cacheService.get(verifyKey);
    if (verifyCode !== code) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        'Verify code is not correct',
      );
    }
    existAccount.status = AccountStatus.ACTIVE;
    await existAccount.save();
    await this.cacheService.del(verifyKey);
  }

  async resendVerifyCode(contact: EmailDto): Promise<void> {
    /**
     * find account in database
     * if account exist, check account status
     * if account status is inactive, resend verify code, then cache verify code
     */
    const existAccount = await this.findOneByCondition({
      email: contact.email,
    });
    if (existAccount?.status !== AccountStatus.INACTIVE) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        `Account is already ${existAccount.status}`,
      );
    }
    await this.sendVerifyEmail(existAccount.username, existAccount.email);
  }

  async sendVerifyEmail(username: string, email: string): Promise<void> {
    const verifyCode = generateCode();
    this.mailService.verify(username, email, verifyCode);
    await this.cacheService.set(
      `email:${email}:verifyCode`,
      verifyCode,
      this.configService.get<number>('VERIFY_TTL'),
    );
  }

  async changeUsername(
    password: string,
    newUsername: string,
    oldUsername: string,
  ): Promise<void> {
    /**
     * check old username can not be equals to new username
     */
    if (oldUsername === newUsername) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        'new username cant not be equal to current username',
      );
    }
    /**
     * check account exist, account status, then check password
     */
    const existAccount = await this.checkAccountByUsername(
      true,
      true,
      oldUsername,
    );
    password = await encrypt(password);
    if (existAccount.password !== password) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        'Password is not correct',
      );
    }
    /**
     * if account is exist, check new account with username
     */
    const countExist = await this.countAllByCondition({
      username: newUsername,
    });
    if (countExist) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        'Account with username already exist',
      );
    }
    /**
     * if account with new username is not exist, change username
     */
    existAccount.username = newUsername;
    await existAccount.save();
    /**
     * after change username, destroy all cache
     */
    await this.cacheService.destroyAllKeys(`user:${oldUsername}:*`);
  }

  async changePassword(
    passwordInfo: ChangePasswordDto,
    username: string,
  ): Promise<void> {
    /**
     * old password can not be equal new password
     */
    if (passwordInfo.newPassword === passwordInfo.oldPassword) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        'new password can not be equal to old password',
      );
    }
    /**
     * check account and account status
     * then, check old password
     */
    const existAccount = await this.checkAccountByUsername(
      true,
      true,
      username,
    );
    const password = await encrypt(passwordInfo.oldPassword);
    if (password !== existAccount.password) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        'Old password is not correct',
      );
    }
    /**
     * if account is exist and status is active, change password
     */
    existAccount.password = await encrypt(passwordInfo.newPassword);
    await existAccount.save();
    /**
     * after change password, destroy all cache
     */
    await this.cacheService.destroyAllKeys(`user:${existAccount.username}:*`);
  }

  async changeEmailRequired(
    emailInfo: ChangeEmailRequireDto,
    username: string,
  ): Promise<void> {
    /**
     * check exist account and status, then check password
     */
    const existAccount = await this.checkAccountByUsername(
      true,
      true,
      username,
    );
    emailInfo.password = await encrypt(emailInfo.password);
    if (emailInfo.password !== existAccount.password) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        'Password is not correct',
      );
    }
    /**
     * check old email can not be equal new email
     */
    if (emailInfo.email === existAccount.email) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        'new email can not be equal to old email',
      );
    }
    /**
     * check email already exist ?
     */
    const countExist = await this.countAllByCondition({
      email: emailInfo.email,
    });
    if (countExist) {
      throw new AppHttpException(HttpStatus.BAD_REQUEST, 'Email already exist');
    }

    const verifyCode = generateCode();
    this.mailService.changeEmail(
      existAccount.username,
      emailInfo.email,
      verifyCode,
    );
    /**
     * cache verify code
     */
    await this.cacheService.set(
      `user:${existAccount.username}:${emailInfo.email}:changeCode`,
      verifyCode,
      this.configService.get<number>('VERIFY_TTL'),
    );
  }

  async changeEmail(
    email: string,
    code: string,
    username: string,
  ): Promise<any> {
    const existAccount = await this.checkAccountByUsername(
      true,
      true,
      username,
    );
    const verifyCode = await this.cacheService.get(
      `user:${username}:${email}:changeCode`,
    );
    if (verifyCode !== code) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        'Verify code is not correct',
      );
    }
    const oldEmail = existAccount.email;
    existAccount.email = email;
    await existAccount.save();
    /**
     * remove cache
     */
    await this.cacheService.destroyAllKeys(
      `user:${existAccount.username}:*:changeCode`,
    );
    await this.cacheService.destroyAllKeys(`email:${oldEmail}:*`);
  }

  async requireForgotPassword(email: string): Promise<void> {
    const existAccount = await this.findOneByCondition({ email });
    if (!existAccount) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        'Account with this email is not exist',
      );
    }
    if (existAccount.status !== AccountStatus.ACTIVE) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        `Account with this email was ${existAccount.status}`,
      );
    }
    const verifyCode = generateCode();
    await this.mailService.forgotPassword(email, verifyCode);
    /**
     * cache verifyCode
     */
    await this.cacheService.set(
      `email:${email}:forgotPasswordCode`,
      verifyCode,
      this.configService.get<number>('VERIFY_TTL'),
    );
  }

  async forgotPassword(forgotInfo: ForgotPasswordDto): Promise<void> {
    const { email, code } = forgotInfo;
    let { password } = forgotInfo;
    const verifyCode = await this.cacheService.get(
      `email:${email}:forgotPasswordCode`,
    );
    if (verifyCode !== code) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        'Verify code is not correct',
      );
    }
    const existAccount = await this.findOneByCondition({ email });
    password = await encrypt(password);
    existAccount.password = password;
    await existAccount.save();
    /**
     * clear cache
     */
    await this.cacheService.del(`email:${email}:forgotPasswordCode`);
    /**
     * revoke token, destroy all token
     */
    await this.cacheService.destroyAllKeys(`user:${existAccount.username}:*`);
  }

  async updateAvatar(
    username: string,
    file: Express.Multer.File,
  ): Promise<void> {
    const existAccount = await this.findOneByCondition({ username });
    if (!existAccount) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        'Account with this email is not exist',
      );
    }
    if (existAccount.status !== AccountStatus.ACTIVE) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        `Account with this email was ${existAccount.status}`,
      );
    }
    const uploaded = await this.uploadService.uploadToCloudinary(file);
    /**
     * if have avatar in cloud, remove it
     */
    if (existAccount.avatar) {
      await this.uploadService.removeFromCloudinary(
        getPublicId(existAccount.avatar),
      );
    }
    /**
     * final, update url
     */
    existAccount.avatar = uploaded.url;
    await existAccount.save();
  }

  async getAllAccounts(page: number): Promise<IPaginate<Account>> {
    if (page <= 0) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        'Page number is not valid',
      );
    }
    const accounts = await this.findAllWithLimit(
      (page - 1) * MAX_ELEMENTS_OF_PAGE,
      MAX_ELEMENTS_OF_PAGE,
    );
    if (accounts.length === 0) {
      throw new AppHttpException(HttpStatus.BAD_REQUEST, 'Out of range');
    }
    /**
     * get count total element from cache
     */
    const totalElements = Number(
      await this.cacheService.get('shop:all:accounts'),
    );
    return {
      page,
      totalPages: getTotalPages(totalElements),
      totalElements,
      elements: accounts,
    };
  }

  async changeStatus(
    superuser: string,
    accountID: string,
    status: AccountStatus,
  ): Promise<void> {
    const existAccount = await this.findOneByCondition({
      pkAccount: accountID,
    });

    if (!existAccount) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        'Account with this ID is not exist',
      );
    }

    if (status === existAccount.status) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        `Account status is already ${status}`,
      );
    }

    if (existAccount.username === superuser) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        `Can not change status of your self`,
      );
    }

    existAccount.status = status;
    await existAccount.save();
    /**
     * revoke token
     */
    await this.cacheService.destroyAllKeys(`user:${existAccount.username}:*`);
  }

  async changeRole(
    superuser: string,
    accountID: string,
    role: Role,
  ): Promise<void> {
    const existAccount = await this.findOneByCondition({
      pkAccount: accountID,
    });

    if (!existAccount) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        'Account with this ID is not exist',
      );
    }

    if (role === existAccount.role) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        `Account role is already ${role}`,
      );
    }

    if (existAccount.username === superuser) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        `Can not change role of your self`,
      );
    }

    existAccount.role = role;
    await existAccount.save();
    /**
     * change role in cache
     */
    await this.cacheService.set(
      `user:${existAccount.username}:role`,
      existAccount.role,
      this.configService.get<number>('INFINITY_TTL'),
    );
  }

  async superuserCreateAccount(email: string, role: Role): Promise<void> {
    const existAccount = await this.findOneByCondition({ email });
    /**
     * check account with this email exist ?
     */
    if (existAccount) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        'Account with this email is already exist',
      );
    }
    /**
     * random username password and insert to database
     */
    const username = randomString(6);
    const password = randomString(8);
    const account = new Account(
      username,
      password,
      email,
      role,
      AccountStatus.ACTIVE,
    );
    await this.repository.insert(account);
    /**
     * update cache quantity
     */
    await this.cacheService.updateQuantityValue(`shop:all:accounts`, 1);
    /**
     * send temporary username and password to new user's email
     */
    this.mailService.create(email, username, password);
  }

  async synchronizedCache(): Promise<void> {
    const totalElements = await this.countAllByCondition({});
    await this.cacheService.set(
      `shop:all:accounts`,
      String(totalElements),
      this.configService.get<number>('INFINITY_TTL'),
    );
  }

  async getAccountInformation(username: string): Promise<Account> {
    const existAccount = await this.findOneByCondition({ username });
    if (existAccount.status !== AccountStatus.ACTIVE) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        `Account was ${existAccount.status}`,
      );
    }
    return existAccount;
  }

  async checkAccountByUsername(
    checkExist: boolean | null,
    checkActive: boolean | null,
    username: string,
  ): Promise<Account> {
    const existAccount = await this.findOneByCondition({ username });
    if (checkExist && !existAccount) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        `Account is not exist`,
      );
    }
    if (checkActive && existAccount.status !== AccountStatus.ACTIVE) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        `Account is already ${existAccount.status}`,
      );
    }
    return existAccount;
  }
}
