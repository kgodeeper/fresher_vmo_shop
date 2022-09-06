import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { HandleResponseInterceptor } from '../../interceptors/handle-response.interceptor';
import { AppModule } from '../../app.module';
import { AuthGuard } from '../../guards/auth.guard';
import * as request from 'supertest';
import { RedisCacheService } from '../caches/cache.service';
import { AccountService } from './account.service';
import { Account } from './account.entity';
import { AccountStatus, Role, Status } from '../../commons/enum.common';
import * as utils from '../../utils/string.util';
import { MailService } from '../mailer/mail.service';
import { RedisCacheModule } from '../caches/cache.module';

let app: INestApplication;
let server: any;
let testModule: TestingModule;
let accountService: AccountService;
const testAccount = new Account('testusr17', 'testpass17', 'test@gmail.com');

describe('Account itegration test', () => {
  beforeAll(async () => {
    testModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(AuthGuard)
      .useValue({
        canActivate: jest.fn(() => true),
      })
      .compile();
    accountService = testModule.get<AccountService>(AccountService);
    app = testModule.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    app.useGlobalInterceptors(new HandleResponseInterceptor());
    await app.init();
    server = app.getHttpServer();
    jest
      .spyOn(testModule.get<RedisCacheService>(RedisCacheService), 'del')
      .mockResolvedValue();
    jest
      .spyOn(testModule.get<RedisCacheService>(RedisCacheService), 'get')
      .mockResolvedValue('value');
    jest
      .spyOn(testModule.get<RedisCacheService>(RedisCacheService), 'set')
      .mockResolvedValue();
    jest
      .spyOn(testModule.get<MailService>(MailService), 'changeEmail')
      .mockReturnValue();
    jest
      .spyOn(testModule.get<MailService>(MailService), 'create')
      .mockReturnValue();
    jest
      .spyOn(testModule.get<MailService>(MailService), 'forgotPassword')
      .mockReturnValue();
    jest
      .spyOn(testModule.get<MailService>(MailService), 'verify')
      .mockReturnValue();
  });

  describe('PUT accounts/active', () => {
    it('active account success', async () => {
      jest
        .spyOn(accountService, 'findOneByCondition')
        .mockResolvedValue(
          new Account('', '', '', Role.CUSTOMER, AccountStatus.INACTIVE),
        );

      jest
        .spyOn(testModule.get<RedisCacheService>(RedisCacheService), 'get')
        .mockResolvedValue('123456');

      jest.spyOn(Account, 'save').mockResolvedValue({} as Account);

      const response = await request(app.getHttpServer())
        .patch('/accounts/active')
        .send({ email: 'mail@gmail.com', code: '123456' });
      expect(response.status).toBe(200);
    });

    it('active account failure, invalid code', async () => {
      jest
        .spyOn(accountService, 'findOneByCondition')
        .mockResolvedValue(
          new Account('', '', '', Role.CUSTOMER, AccountStatus.INACTIVE),
        );

      jest
        .spyOn(testModule.get<RedisCacheService>(RedisCacheService), 'get')
        .mockResolvedValue('123457');

      jest.spyOn(Account, 'save').mockResolvedValue({} as Account);

      const response = await request(server)
        .patch('/accounts/active')
        .send({ email: 'mail@gmail.com', code: '123456' });
      expect(response.status).toBe(400);
    });

    it('active account failure, invalid information', async () => {
      const response = await request(app.getHttpServer())
        .patch('/accounts/active')
        .send({ email: 'mail', code: '123456' });
      expect(response.status).toBe(400);
    });

    it('active account failure, account was active or block', async () => {
      jest
        .spyOn(accountService, 'findOneByCondition')
        .mockResolvedValue(
          new Account('', '', '', Role.CUSTOMER, AccountStatus.ACTIVE),
        );

      const response = await request(server)
        .patch('/accounts/active')
        .send({ email: 'mail@gmail.com', code: '123456' });
      expect(response.status).toBe(400);
    });
  });

  describe(`POST account/resend-verify-code`, () => {
    it('resend code success', async () => {
      jest
        .spyOn(accountService, 'findOneByCondition')
        .mockResolvedValue({ status: AccountStatus.INACTIVE } as Account);

      jest.spyOn(accountService, 'sendVerifyEmail').mockResolvedValue();

      const response = await request(server)
        .post('/accounts/resend-verify-code')
        .send({ email: 'itpt1711@gmail.com' });
      expect(response.status).toBe(200);
    });

    it('resend code failure, invalid email', async () => {
      jest
        .spyOn(accountService, 'findOneByCondition')
        .mockResolvedValue(null as Account);
      const response = await request(server)
        .post('/accounts/resend-verify-code')
        .send({});
      expect(response.status).toBe(400);
    });

    it('resend code failure, email not exist', async () => {
      jest
        .spyOn(accountService, 'findOneByCondition')
        .mockResolvedValue(null as Account);
      const response = await request(server)
        .post('/accounts/resend-verify-code')
        .send({ mail: 'itpt1711@gmail.com' });
      expect(response.status).toBe(400);
    });
  });

  describe('PATCH /accounts/username', () => {
    it('change username success', async () => {
      jest
        .spyOn(accountService, 'checkAccountByUsername')
        .mockResolvedValue(testAccount);

      jest.spyOn(accountService, 'countAllByCondition').mockResolvedValue(0);

      jest.spyOn(Account, 'save').mockResolvedValue({} as Account);

      jest.spyOn(utils, 'encrypt').mockResolvedValue(testAccount.password);

      jest
        .spyOn(
          testModule.get<RedisCacheService>(RedisCacheService),
          'destroyAllKeys',
        )
        .mockResolvedValue();

      const response = await request(server)
        .patch('/accounts/username')
        .send({ password: 'password11', username: 'hellokitty' });
      expect(response.status).toBe(200);
    });

    it('change username failure, password is not correct', async () => {
      jest
        .spyOn(accountService, 'checkAccountByUsername')
        .mockResolvedValue(testAccount);

      jest.spyOn(accountService, 'countAllByCondition').mockResolvedValue(0);

      jest.spyOn(Account, 'save').mockResolvedValue({} as Account);

      jest
        .spyOn(utils, 'encrypt')
        .mockResolvedValue(testAccount.password + '/');

      const response = await request(server)
        .patch('/accounts/username')
        .send({ password: 'password11', username: 'hellokitty' });
      expect(response.status).toBe(400);
    });

    it('change username failure, username already exist', async () => {
      jest
        .spyOn(accountService, 'checkAccountByUsername')
        .mockResolvedValue(testAccount);

      jest.spyOn(accountService, 'countAllByCondition').mockResolvedValue(1);

      jest.spyOn(Account, 'save').mockResolvedValue({} as Account);

      jest.spyOn(utils, 'encrypt').mockResolvedValue(testAccount.password);

      const response = await request(server)
        .patch('/accounts/username')
        .send({ password: 'password11', username: 'hellokitty' });
      expect(response.status).toBe(400);
    });
  });

  describe('PATCH /accounts/password', () => {
    it('Change password success', async () => {
      jest
        .spyOn(accountService, 'checkAccountByUsername')
        .mockResolvedValue(testAccount);

      jest.spyOn(accountService, 'countAllByCondition').mockResolvedValue(0);

      jest.spyOn(Account, 'save').mockResolvedValue({} as Account);

      jest.spyOn(utils, 'encrypt').mockResolvedValue(testAccount.password);

      jest
        .spyOn(
          testModule.get<RedisCacheService>(RedisCacheService),
          'destroyAllKeys',
        )
        .mockResolvedValue();

      const response = await request(server)
        .patch('/accounts/password')
        .send({ oldPassword: 'password11', newPassword: 'password17' });
      expect(response.status).toBe(200);
    });

    it('Change password failure, old password equal to new password', async () => {
      jest
        .spyOn(accountService, 'checkAccountByUsername')
        .mockResolvedValue(testAccount);

      jest.spyOn(accountService, 'countAllByCondition').mockResolvedValue(0);

      jest.spyOn(Account, 'save').mockResolvedValue({} as Account);

      jest.spyOn(utils, 'encrypt').mockResolvedValue(testAccount.password);

      jest
        .spyOn(
          testModule.get<RedisCacheService>(RedisCacheService),
          'destroyAllKeys',
        )
        .mockResolvedValue();

      const response = await request(server)
        .patch('/accounts/password')
        .send({ oldPassword: 'password11', newPassword: 'password11' });
      expect(response.status).toBe(400);
    });

    it('Change password failure, password not correct', async () => {
      jest
        .spyOn(accountService, 'checkAccountByUsername')
        .mockResolvedValue(testAccount);

      jest.spyOn(accountService, 'countAllByCondition').mockResolvedValue(0);

      jest.spyOn(Account, 'save').mockResolvedValue({} as Account);

      jest.spyOn(utils, 'encrypt').mockResolvedValue(testAccount.password);

      jest
        .spyOn(
          testModule.get<RedisCacheService>(RedisCacheService),
          'destroyAllKeys',
        )
        .mockResolvedValue();

      const response = await request(server)
        .patch('/accounts/password')
        .send({ oldPassword: 'password11/', newPassword: 'password11' });
      expect(response.status).toBe(400);
    });
  });

  describe('POST change-email-require', () => {
    it('Require change email success', async () => {
      jest
        .spyOn(accountService, 'checkAccountByUsername')
        .mockResolvedValue(testAccount);

      jest.spyOn(utils, 'encrypt').mockResolvedValue(testAccount.password);

      jest.spyOn(accountService, 'countAllByCondition').mockResolvedValue(0);

      const response = await request(server)
        .post('/accounts/change-email-require')
        .send({ password: testAccount.password, email: 'test1@gmail.com' });

      expect(response.status).toBe(200);
    });

    it('Require change email failure, password is not correct', async () => {
      jest
        .spyOn(accountService, 'checkAccountByUsername')
        .mockResolvedValue(testAccount);

      jest
        .spyOn(utils, 'encrypt')
        .mockResolvedValue(testAccount.password + '/');

      jest.spyOn(accountService, 'countAllByCondition').mockResolvedValue(0);

      const response = await request(server)
        .post('/accounts/change-email-require')
        .send({ password: testAccount.password, email: 'test1@gmail.com' });

      expect(response.status).toBe(400);
    });

    it('Require change email failure, email equals old email', async () => {
      jest
        .spyOn(accountService, 'checkAccountByUsername')
        .mockResolvedValue(testAccount);

      jest
        .spyOn(utils, 'encrypt')
        .mockResolvedValue(testAccount.password + '/');

      jest.spyOn(accountService, 'countAllByCondition').mockResolvedValue(0);

      const response = await request(server)
        .post('/accounts/change-email-require')
        .send({ password: testAccount.password, email: 'test@gmail.com' });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /accounts/email', () => {
    it('Change email success', async () => {
      jest
        .spyOn(accountService, 'checkAccountByUsername')
        .mockResolvedValue(testAccount);

      jest
        .spyOn(testModule.get<RedisCacheService>(RedisCacheService), 'get')
        .mockResolvedValue('123456');

      jest.spyOn(Account, 'save').mockResolvedValue({} as Account);

      jest
        .spyOn(
          testModule.get<RedisCacheService>(RedisCacheService),
          'destroyAllKeys',
        )
        .mockResolvedValue();

      const response = await request(server)
        .patch('/accounts/email')
        .send({ code: '123456', email: 'test@gmail.com' });

      expect(response.status).toBe(200);
    });

    it('Change email failure, invalid code ', async () => {
      jest
        .spyOn(accountService, 'checkAccountByUsername')
        .mockResolvedValue(testAccount);

      jest
        .spyOn(testModule.get<RedisCacheService>(RedisCacheService), 'get')
        .mockResolvedValue('123456');

      jest.spyOn(Account, 'save').mockResolvedValue({} as Account);

      jest
        .spyOn(
          testModule.get<RedisCacheService>(RedisCacheService),
          'destroyAllKeys',
        )
        .mockResolvedValue();

      const response = await request(server)
        .patch('/accounts/email')
        .send({ code: '123457', email: 'test@gmail.com' });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /forgot-password-require', () => {
    const activeAccount = new Account(
      'activeAcc',
      'active17k',
      'active@gmail.com',
      Role.CUSTOMER,
      AccountStatus.ACTIVE,
    );
    const inactiveAccount = new Account(
      'activeAcc',
      'active17k',
      'active@gmail.com',
      Role.CUSTOMER,
      AccountStatus.INACTIVE,
    );
    it('require forgot password success', async () => {
      jest
        .spyOn(accountService, 'findOneByCondition')
        .mockResolvedValue(activeAccount);
      const response = await request(server)
        .post('/accounts/forgot-password-require')
        .send({ email: 'active@gmail.com' });
      expect(response.status).toBe(200);
    });

    it('require forgot password failure, inactive account', async () => {
      jest
        .spyOn(accountService, 'findOneByCondition')
        .mockResolvedValue(inactiveAccount);
      const response = await request(server)
        .post('/accounts/forgot-password-require')
        .send({ email: 'active@gmail.com' });

      expect(response.status).toBe(400);
    });

    it('require forgot password failure, account is not exist', async () => {
      jest
        .spyOn(accountService, 'findOneByCondition')
        .mockResolvedValue(null as Account);

      const response = await request(server)
        .post('/accounts/forgot-password-require')
        .send({ email: 'active@gmail.com' });

      expect(response.status).toBe(400);
    });
  });
});
