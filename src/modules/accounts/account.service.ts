import { HttpStatus, Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { RedisCacheService } from '../caches/cache.service';
import { ServiceUtil } from '../../utils/service.utils';
import { Account } from './account.entity';
import { AccountStatus, LoginMethod, Role } from '../../commons/enum.common';
import { AppHttpException } from '../../exceptions/http.exception';
import { MailService } from '../mailer/mail.service';
import {
  encrypt,
  generateCode,
  getPublicId,
  randomString,
} from '../../utils/string.util';
import { ConfigService } from '@nestjs/config';
import {
  ChangeEmailRequireDto,
  ChangePasswordDto,
  ForgotPasswordDto,
  ResendCodeDto,
  UpdateAccountDto,
} from './account.dto';
import { UploadService } from '../uploads/upload.service';
import { IPagination } from '../../utils/interface.util';
import { MAX_ELEMENTS_OF_PAGE } from '../../commons/const.common';
import { PaginationService } from '../paginations/pagination.service';

@Injectable()
export class AccountService extends ServiceUtil<Account, Repository<Account>> {
  protected repository;
  constructor(
    private dataSource: DataSource,
    private mailService: MailService,
    private paginationService: PaginationService<Account>,
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
    account: string;
    code: string;
  }): Promise<void> {
    const { account, code } = verifyInfo;
    const existAccount = await this.getInactiveAccountName(account);
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

  async resendVerifyCode(contact: ResendCodeDto): Promise<void> {
    /**
     * find account in database
     * if account exist, check account status
     * if account status is inactive, resend verify code, then cache verify code
     */
    const existAccount = await this.getInactiveAccountName(contact.account);
    await this.checkSpam(existAccount.username);
    await this.sendVerifyEmail(existAccount.username, existAccount.email);
  }

  async sendVerifyEmail(username: string, email: string): Promise<void> {
    const verifyCode = generateCode();
    await this.checkSpam(email);
    this.mailService.verify(username, email, verifyCode);
    await this.cacheService.set(`email:${email}:wasSend`, '1', 60);
    await this.cacheService.set(
      `email:${email}:verifyCode`,
      verifyCode,
      this.configService.get<number>('VERIFY_TTL'),
    );
  }

  async checkSpam(email: string): Promise<void> {
    const wasSend = await this.cacheService.get(`email:${email}:wasSend`);
    if (wasSend) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        'Please wait a minute to resend email',
      );
    }
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
    const existAccount = await this.getActiveAccountName(oldUsername);
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
    const accountIsExist = await this.checkAccountIsExist(newUsername);
    if (accountIsExist) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        `Account with ${newUsername} already exist`,
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
    const existAccount = await this.getActiveAccountName(username);
    this.requireBothLogin(existAccount);
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
    const existAccount = await this.getActiveAccountName(username);
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
    if (emailInfo.newEmail === existAccount.email) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        'new email can not be equal to old email',
      );
    }
    /**
     * check email already exist ?
     */
    const accountIsExist = await this.checkEmailIsExist(emailInfo.newEmail);
    if (accountIsExist) {
      throw new AppHttpException(HttpStatus.BAD_REQUEST, 'Email already exist');
    }

    const verifyCode = generateCode();
    this.mailService.changeEmail(
      existAccount.username,
      emailInfo.newEmail,
      verifyCode,
    );
    /**
     * cache verify code
     */
    await this.cacheService.set(
      `user:${existAccount.username}:${existAccount.email}:changeCode:${emailInfo.newEmail}`,
      verifyCode,
      this.configService.get<number>('VERIFY_TTL'),
    );
  }

  async changeEmail(code: string, username: string): Promise<any> {
    const existAccount = await this.getActiveAccountName(username);
    const cachedCode = (
      await this.cacheService.keys(
        `user:${existAccount.username}:${existAccount.email}:changeCode:*`,
      )
    )[0];
    if (!cachedCode) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        `Not exist change email require`,
      );
    }
    const newEmail = cachedCode.split(':').at(-1);
    const verifyCode = await this.cacheService.get(cachedCode);
    if (verifyCode !== code) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        'Verify code is not correct',
      );
    }
    const oldEmail = existAccount.email;
    existAccount.email = newEmail;
    await existAccount.save();
    /**
     * remove cache
     */
    await this.cacheService.destroyAllKeys(
      `user:${existAccount.username}:*:changeCode:*`,
    );
    await this.cacheService.destroyAllKeys(`email:${oldEmail}:*`);
  }

  async requireForgotPassword(email: string): Promise<void> {
    const existAccount = await this.getActiveAccountName(email);
    this.requireBothLogin(existAccount);
    const verifyCode = generateCode();
    await this.mailService.forgotPassword(existAccount.email, verifyCode);
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
    const { email, code, newPassword } = forgotInfo;
    const existAccount = await this.getActiveAccountName(email);
    this.requireBothLogin(existAccount);
    const verifyCode = await this.cacheService.get(
      `email:${email}:forgotPasswordCode`,
    );
    if (verifyCode !== code) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        'Verify code is not correct',
      );
    }
    existAccount.password = await encrypt(newPassword);
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
    const existAccount = await this.getActiveAccountName(username);
    if (!file) {
      throw new AppHttpException(HttpStatus.BAD_REQUEST, 'File not found');
    }
    const uploaded = await this.uploadService.uploadToCloudinary(
      file,
      `avatars`,
    );
    /**
     * if have avatar in cloud, remove it
     */
    if (existAccount.avatar) {
      await this.uploadService.removeFromCloudinary(
        getPublicId(existAccount.avatar),
        'avatars',
      );
    }
    /**
     * final, update url
     */
    existAccount.avatar = uploaded.url;
    await existAccount.save();
  }

  async getAllAccounts(
    page: number,
    limit: number,
    search: string,
    sort: string,
    filter: string,
  ): Promise<IPagination<Account>> {
    if (limit <= 0) limit = MAX_ELEMENTS_OF_PAGE;
    if (page <= 0) page = 1;
    const accounts = await this.findAllWithLimit((page - 1) * limit, limit);
    if (accounts.length === 0) {
      throw new AppHttpException(HttpStatus.BAD_REQUEST, 'Out of range');
    }
    /**
     * get count total element from cache
     */
    const totalElements = Number(
      await this.cacheService.get('shop:all:accounts'),
    );
    this.paginationService.setPrefix('accounts/all');
    return this.paginationService.getResponseObject(
      accounts,
      totalElements,
      page,
      limit,
      search,
      sort,
      filter,
      null,
    );
  }

  async changeStatus(
    superuser: string,
    accountID: string,
    status: AccountStatus,
  ): Promise<void> {
    const existAccount = await this.getAccountById(accountID);
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
    const existAccount = await this.getAccountById(accountID);

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
    const isExistAccount = await this.checkEmailIsExist(email);
    if (isExistAccount) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        `Account with email ${email} already exist`,
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
    await this.insertAccount(account);
    /**
     * update cache quantity
     */
    await this.cacheService.updateQuantityValue(`shop:all:accounts`, 1);
    /**
     * send temporary username and password to new user's email
     */
    this.mailService.create(email, username, password);
  }

  async getAccountInformation(username: string): Promise<Account> {
    const existAccount = await this.getActiveAccountName(username);
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

  async getActiveAccountName(account: string): Promise<Account> {
    const existAccount = await this.findOneByCondition([
      { email: account },
      { username: account },
    ]);
    if (!existAccount) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        `Account with account name ${account} is not exist`,
      );
    }
    if (existAccount.status !== AccountStatus.ACTIVE) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        `Account with account name ${account} was ${existAccount.status}`,
      );
    }
    return existAccount;
  }

  async getInactiveAccountName(account: string): Promise<Account> {
    const existAccount = await this.findOneByCondition([
      { email: account },
      { username: account },
    ]);
    if (!existAccount) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        `Account with account name ${account} is not exist`,
      );
    }
    if (existAccount.status === AccountStatus.ACTIVE) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        `Account with account name ${account} was ${existAccount.status}`,
      );
    }
    return existAccount;
  }

  async checkAccountIsExist(account: string): Promise<boolean> {
    const existAccount = await this.findOneByCondition([
      { username: account },
      { password: account },
    ]);
    return !!existAccount;
  }

  async getAccountById(id: string): Promise<Account> {
    const existAccount = await this.findOneByCondition({ pkAccount: id });
    if (!existAccount) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        `Account with id ${id} is not exist`,
      );
    }
    return existAccount;
  }

  async insertAccount(account: Account): Promise<void> {
    await this.repository.insert(account);
  }

  async checkEmailIsExist(email: string): Promise<boolean> {
    const existAccount = await this.findOneByCondition({ email });
    return !!existAccount;
  }

  async saveAccount(account: Account): Promise<void> {
    this.repository.save(account);
  }

  requireBothLogin(account: Account): void {
    if (account.loginMethod !== LoginMethod.BOTH) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        'You was logged in by email, to use this feature, you need update your username and password',
      );
    }
  }

  async updateAccount(
    accountInfo: UpdateAccountDto,
    username: string,
  ): Promise<void> {
    const existAccount = await this.getActiveAccountName(username);
    const oldName = existAccount.username;
    if (existAccount.loginMethod !== LoginMethod.EMAIL) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        'You already update account before',
      );
    }
    const accountIsExist = await this.checkAccountIsExist(accountInfo.username);
    if (accountIsExist) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        `Account with username ${accountInfo.username} already exist`,
      );
    }
    existAccount.username = accountInfo.username;
    existAccount.password = await encrypt(accountInfo.password);
    existAccount.loginMethod = LoginMethod.BOTH;
    await this.saveAccount(existAccount);
    /**
     * remove all cached
     */
    await this.cacheService.destroyAllKeys(`user:${oldName}:*`);
  }
}
