import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
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
import { UploadService } from '../uploads/upload.service';
import { RoleGuard } from '../../guards/role.guard';
import { AppHttpException } from '../../exceptions/http.exception';

let app: INestApplication;
let test: any;
let testModule: TestingModule;
let accountService: AccountService;
const activeAccount = new Account(
  'supertest',
  'supertest1',
  'test@gmail.com',
  Role.CUSTOMER,
  AccountStatus.ACTIVE,
);
const inactiveAccount = new Account(
  'supertest',
  'supertest1',
  'test@gmail.com',
  Role.CUSTOMER,
  AccountStatus.INACTIVE,
);

activeAccount.save = jest.fn(() => null);
inactiveAccount.save = jest.fn(() => null);

describe('Account itegration test', () => {
  beforeAll(async () => {
    testModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(AuthGuard)
      .useValue({
        canActivate: jest.fn(() => true),
      })
      .overrideGuard(RoleGuard)
      .useValue({
        canActive: jest.fn(() => true),
      })
      .compile();
    accountService = testModule.get<AccountService>(AccountService);
    app = testModule.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    app.useGlobalInterceptors(new HandleResponseInterceptor());
    await app.init();
    test = request(app.getHttpServer());
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
        .mockResolvedValue(inactiveAccount);

      jest
        .spyOn(testModule.get<RedisCacheService>(RedisCacheService), 'get')
        .mockResolvedValue('123456');

      const response = await test
        .patch('/accounts/active')
        .send({ account: 'mail@gmail.com', code: '123456' });
      expect(response.status).toBe(200);
    });

    it('active account failure, invalid code', async () => {
      jest
        .spyOn(accountService, 'findOneByCondition')
        .mockResolvedValue(activeAccount);

      jest
        .spyOn(testModule.get<RedisCacheService>(RedisCacheService), 'get')
        .mockResolvedValue('123457');

      jest.spyOn(Account, 'save').mockImplementation(() => null);

      const response = await test
        .patch('/accounts/active')
        .send({ account: 'mail@gmail.com', code: '123456' });
      expect(response.status).toBe(400);
    });

    it('active account failure, invalid information', async () => {
      const response = await request(app.getHttpServer())
        .patch('/accounts/active')
        .send({ account: 'mail', code: '123456' });
      expect(response.status).toBe(400);
    });

    it('active account failure, account was active or block', async () => {
      jest
        .spyOn(accountService, 'findOneByCondition')
        .mockResolvedValue(activeAccount);

      const response = await test
        .patch('/accounts/active')
        .send({ account: 'mail@gmail.com', code: '123456' });
      expect(response.status).toBe(400);
    });
  });

  describe(`POST account/resend-verify-code`, () => {
    it('resend code success', async () => {
      jest
        .spyOn(accountService, 'findOneByCondition')
        .mockResolvedValue(
          new Account('', '', '', Role.CUSTOMER, AccountStatus.INACTIVE),
        );

      jest.spyOn(accountService, 'sendVerifyEmail').mockResolvedValue();
      jest.spyOn(accountService, 'checkSpam').mockResolvedValue();
      const response = await test
        .post('/accounts/resend-verify-code')
        .send({ account: 'vmoder06@gmail.com' });
      expect(response.status).toBe(200);
    });

    it('resend code failure, invalid email', async () => {
      jest
        .spyOn(accountService, 'findOneByCondition')
        .mockResolvedValue(null as Account);
      const response = await test.post('/accounts/resend-verify-code').send({});
      expect(response.status).toBe(400);
    });

    it('resend code failure, email not exist', async () => {
      jest
        .spyOn(accountService, 'findOneByCondition')
        .mockResolvedValue(null as Account);
      const response = await test
        .post('/accounts/resend-verify-code')
        .send({ mail: 'itpt1711@gmail.com' });
      expect(response.status).toBe(400);
    });
  });

  describe('PATCH /accounts/username', () => {
    it('change username success', async () => {
      jest
        .spyOn(accountService, 'findOneByCondition')
        .mockResolvedValue(activeAccount);

      jest
        .spyOn(accountService, 'checkAccountIsExist')
        .mockResolvedValue(false);

      jest.spyOn(accountService, 'countAllByCondition').mockResolvedValue(0);

      jest.spyOn(utils, 'encrypt').mockResolvedValue(activeAccount.password);

      jest
        .spyOn(
          testModule.get<RedisCacheService>(RedisCacheService),
          'destroyAllKeys',
        )
        .mockResolvedValue();

      const response = await test
        .patch('/accounts/username')
        .send({ password: activeAccount.password, username: 'hellokitty' });
      expect(response.status).toBe(200);
    });

    it('change username failure, password is not correct', async () => {
      jest
        .spyOn(accountService, 'checkAccountByUsername')
        .mockResolvedValue(activeAccount);

      jest.spyOn(accountService, 'countAllByCondition').mockResolvedValue(0);
      jest
        .spyOn(utils, 'encrypt')
        .mockResolvedValue(activeAccount.password + '/');

      const response = await test
        .patch('/accounts/username')
        .send({ password: 'password11', username: 'hellokitty' });
      expect(response.status).toBe(400);
    });

    it('change username failure, username already exist', async () => {
      jest
        .spyOn(accountService, 'checkAccountByUsername')
        .mockResolvedValue(activeAccount);

      jest.spyOn(accountService, 'checkAccountIsExist').mockResolvedValue(true);

      jest.spyOn(utils, 'encrypt').mockResolvedValue(activeAccount.password);

      const response = await test
        .patch('/accounts/username')
        .send({ password: activeAccount.password, username: 'hellokitty' });
      expect(response.status).toBe(400);
    });
  });

  describe('PATCH /accounts/password', () => {
    it('Change password success', async () => {
      jest
        .spyOn(accountService, 'checkAccountByUsername')
        .mockResolvedValue(activeAccount);

      jest.spyOn(accountService, 'countAllByCondition').mockResolvedValue(0);

      jest.spyOn(accountService, 'requireBothLogin').mockReturnValue();

      jest.spyOn(utils, 'encrypt').mockResolvedValue(activeAccount.password);

      jest
        .spyOn(
          testModule.get<RedisCacheService>(RedisCacheService),
          'destroyAllKeys',
        )
        .mockResolvedValue();

      const response = await test
        .patch('/accounts/password')
        .send({ oldPassword: 'password11', newPassword: 'password17' });
      expect(response.status).toBe(200);
    });

    it('Change password failure, old password equal to new password', async () => {
      jest
        .spyOn(accountService, 'checkAccountByUsername')
        .mockResolvedValue(activeAccount);

      jest.spyOn(accountService, 'countAllByCondition').mockResolvedValue(0);

      jest.spyOn(Account, 'save').mockImplementation(() => null);

      jest.spyOn(utils, 'encrypt').mockResolvedValue(activeAccount.password);

      jest
        .spyOn(
          testModule.get<RedisCacheService>(RedisCacheService),
          'destroyAllKeys',
        )
        .mockResolvedValue();

      const response = await test
        .patch('/accounts/password')
        .send({ oldPassword: 'password11', newPassword: 'password11' });
      expect(response.status).toBe(400);
    });

    it('Change password failure, password not correct', async () => {
      jest
        .spyOn(accountService, 'checkAccountByUsername')
        .mockResolvedValue(activeAccount);

      jest.spyOn(accountService, 'countAllByCondition').mockResolvedValue(0);

      jest.spyOn(Account, 'save').mockImplementation(() => null);

      jest
        .spyOn(utils, 'encrypt')
        .mockResolvedValue(activeAccount.password + '/');

      jest
        .spyOn(
          testModule.get<RedisCacheService>(RedisCacheService),
          'destroyAllKeys',
        )
        .mockResolvedValue();

      const response = await test
        .patch('/accounts/password')
        .send({ oldPassword: 'password11/', newPassword: 'password11' });
      expect(response.status).toBe(400);
    });
  });

  describe('POST change-email-require', () => {
    it('Require change email success', async () => {
      jest
        .spyOn(accountService, 'findOneByCondition')
        .mockResolvedValue(activeAccount);

      jest.spyOn(utils, 'encrypt').mockResolvedValue(activeAccount.password);

      jest
        .spyOn(accountService, 'findOneByCondition')
        .mockResolvedValue(activeAccount);

      jest.spyOn(accountService, 'checkEmailIsExist').mockResolvedValue(false);

      const response = await test.post('/accounts/change-email-require').send({
        password: activeAccount.password,
        newEmail: 'test1@gmail.com',
      });

      expect(response.status).toBe(200);
    });

    it('Require change email failure, email already exist', async () => {
      jest
        .spyOn(accountService, 'findOneByCondition')
        .mockResolvedValue(activeAccount);

      jest.spyOn(utils, 'encrypt').mockResolvedValue(activeAccount.password);

      jest
        .spyOn(accountService, 'findOneByCondition')
        .mockResolvedValue(activeAccount);

      jest
        .spyOn(accountService, 'checkEmailIsExist')
        .mockRejectedValue(new AppHttpException(HttpStatus.BAD_REQUEST, ''));

      const response = await test.post('/accounts/change-email-require').send({
        password: activeAccount.password,
        newEmail: 'test1@gmail.com',
      });

      expect(response.status).toBe(400);
    });

    it('Require change email failure, password is not correct', async () => {
      jest
        .spyOn(accountService, 'findOneByCondition')
        .mockResolvedValue(activeAccount);

      jest
        .spyOn(utils, 'encrypt')
        .mockResolvedValue(activeAccount.password + '/');

      jest.spyOn(accountService, 'countAllByCondition').mockResolvedValue(0);

      const response = await test.post('/accounts/change-email-require').send({
        password: activeAccount.password,
        newEmail: 'test1@gmail.com',
      });

      expect(response.status).toBe(400);
    });

    it('Require change email failure, email equals old email', async () => {
      jest
        .spyOn(accountService, 'checkAccountByUsername')
        .mockResolvedValue(activeAccount);

      jest.spyOn(accountService, 'countAllByCondition').mockResolvedValue(0);

      const response = await test.post('/accounts/change-email-require').send({
        password: activeAccount.password,
        newEmail: activeAccount.email,
      });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /accounts/email', () => {
    it('Change email success', async () => {
      jest
        .spyOn(accountService, 'findOneByCondition')
        .mockResolvedValue(activeAccount);
      jest
        .spyOn(testModule.get<RedisCacheService>(RedisCacheService), 'keys')
        .mockResolvedValue([':::']);
      jest
        .spyOn(testModule.get<RedisCacheService>(RedisCacheService), 'get')
        .mockResolvedValue('123456');
      jest
        .spyOn(
          testModule.get<RedisCacheService>(RedisCacheService),
          'destroyAllKeys',
        )
        .mockResolvedValue();

      const response = await test
        .patch('/accounts/email')
        .send({ code: '123456' });

      expect(response.status).toBe(200);
    });

    it('Change email failure, invalid code ', async () => {
      jest
        .spyOn(accountService, 'findOneByCondition')
        .mockResolvedValue(activeAccount);
      jest
        .spyOn(testModule.get<RedisCacheService>(RedisCacheService), 'keys')
        .mockResolvedValue([':::']);
      jest
        .spyOn(testModule.get<RedisCacheService>(RedisCacheService), 'get')
        .mockResolvedValue('123456');
      jest
        .spyOn(
          testModule.get<RedisCacheService>(RedisCacheService),
          'destroyAllKeys',
        )
        .mockResolvedValue();

      const response = await test
        .patch('/accounts/email')
        .send({ code: '123457' });

      expect(response.status).toBe(400);
    });

    it('Change email failure, not exist change email require ', async () => {
      jest
        .spyOn(accountService, 'findOneByCondition')
        .mockResolvedValue(activeAccount);
      jest
        .spyOn(testModule.get<RedisCacheService>(RedisCacheService), 'keys')
        .mockResolvedValue([]);
      jest
        .spyOn(testModule.get<RedisCacheService>(RedisCacheService), 'get')
        .mockResolvedValue('123456');
      jest
        .spyOn(
          testModule.get<RedisCacheService>(RedisCacheService),
          'destroyAllKeys',
        )
        .mockResolvedValue();

      const response = await test
        .patch('/accounts/email')
        .send({ code: '123457' });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /forgot-password-require', () => {
    it('require forgot password success', async () => {
      jest
        .spyOn(accountService, 'findOneByCondition')
        .mockResolvedValue(activeAccount);
      const response = await test
        .post('/accounts/forgot-password-require')
        .send({ account: 'active@gmail.com' });
      expect(response.status).toBe(200);
    });

    it('require forgot password failure, inactive account', async () => {
      jest
        .spyOn(accountService, 'findOneByCondition')
        .mockResolvedValue(
          new Account('', '', '', Role.CUSTOMER, AccountStatus.INACTIVE),
        );
      const response = await test
        .post('/accounts/forgot-password-require')
        .send({ account: 'active@gmail.com' });
      expect(response.status).toBe(400);
    });

    it('require forgot password failure, account is not exist', async () => {
      jest
        .spyOn(accountService, 'findOneByCondition')
        .mockResolvedValue(null as Account);

      const response = await test
        .post('/accounts/forgot-password-require')
        .send({ account: 'active@gmail.com' });

      expect(response.status).toBe(400);
    });
  });

  describe('PATCH /accounts/forgot-password', () => {
    const forgotInfo = {
      email: 'itpt1711@gmail.com',
      code: '123456',
      newPassword: 'supertest1',
    };
    it('forgot password success', async () => {
      jest
        .spyOn(accountService, 'findOneByCondition')
        .mockResolvedValue(activeAccount);
      jest
        .spyOn(testModule.get<RedisCacheService>(RedisCacheService), 'get')
        .mockResolvedValue(forgotInfo.code);
      const response = await test
        .patch('/accounts/forgot-password')
        .send(forgotInfo);
      expect(response.status).toBe(200);
    });

    it('forgot password failure, invalid information', async () => {
      const response = await test.patch('/accounts/forgot-password').send({});
      expect(response.status).toBe(400);
    });

    it('forgot password failure, invalid code', async () => {
      jest
        .spyOn(accountService, 'findOneByCondition')
        .mockResolvedValue(activeAccount);
      jest.spyOn(Account, 'save').mockImplementation(() => null);
      jest
        .spyOn(testModule.get<RedisCacheService>(RedisCacheService), 'get')
        .mockResolvedValue(forgotInfo.code + '7');
      const response = await test
        .patch('/accounts/forgot-password')
        .send(forgotInfo);
      expect(response.status).toBe(400);
    });

    it('forgot password failure, account is not exist', async () => {
      jest
        .spyOn(accountService, 'findOneByCondition')
        .mockResolvedValue(null as Account);
      const response = await test
        .patch('/accounts/forgot-password')
        .send(forgotInfo);
      expect(response.status).toBe(400);
    });

    it('forgot password failure, account was not active', async () => {
      jest
        .spyOn(accountService, 'findOneByCondition')
        .mockResolvedValue(inactiveAccount);
      jest.spyOn(Account, 'save').mockImplementation(() => null);
      const response = await test
        .patch('/accounts/forgot-password')
        .send(forgotInfo);
      expect(response.status).toBe(400);
    });
  });

  describe('PATCH /accounts/avatar', () => {
    beforeAll(async () => {
      const uploadService = testModule.get<UploadService>(UploadService);
      jest
        .spyOn(uploadService, 'uploadToCloudinary')
        .mockResolvedValue({ url: '' });
      jest.spyOn(uploadService, 'removeFromCloudinary').mockResolvedValue();
    });
    it('update avatar success', async () => {
      jest
        .spyOn(accountService, 'findOneByCondition')
        .mockResolvedValue(activeAccount);

      const response = await test
        .patch('/accounts/avatar')
        .type('form')
        .attach('avatar', 'test/avatar-deep-3.jpg');
      expect(response.status).toBe(200);
    });
    it('update avatar failure, account is not exist', async () => {
      jest
        .spyOn(accountService, 'findOneByCondition')
        .mockResolvedValue(null as Account);

      const response = await test
        .patch('/accounts/avatar')
        .type('form')
        .attach('avatar', 'test/avatar-deep-3.jpg');
      expect(response.status).toBe(400);
    });
    it('update avatar failure, account is not active', async () => {
      jest
        .spyOn(accountService, 'findOneByCondition')
        .mockResolvedValue(
          new Account('', '', '', Role.CUSTOMER, AccountStatus.INACTIVE),
        );
      const response = await test
        .patch('/accounts/avatar')
        .type('form')
        .attach('avatar', 'test/avatar-deep-3.jpg');
      expect(response.status).toBe(400);
    });
    it('update avatar failure, file not found', async () => {
      jest
        .spyOn(accountService, 'findOneByCondition')
        .mockResolvedValue(activeAccount);
      const response = await test.patch('/accounts/avatar').type('form');
      expect(response.status).toBe(400);
    });
  });

  describe('GET /accounts/all', () => {
    it('get page success', async () => {
      jest.spyOn(accountService, 'getAlls').mockResolvedValue(new Array(20));
      const response = await test.get('/accounts/all?page=1&limit=1');
      expect(response.status).toBe(200);
    });

    it('get page success, no page', async () => {
      const response = await test.get('/accounts/all');
      expect(response.status).toBe(200);
    });

    it('get page success, no limit', async () => {
      const response = await test.get('/accounts/all?page=1');
      expect(response.status).toBe(200);
    });
  });

  describe('GET /accounts/status', () => {
    it('change status success', async () => {
      const activeAccount = new Account(
        '',
        '',
        '',
        Role.CUSTOMER,
        AccountStatus.ACTIVE,
      );
      activeAccount.save = jest.fn(() => null);
      jest
        .spyOn(accountService, 'findOneByCondition')
        .mockResolvedValue(activeAccount);
      const response = await test.patch('/accounts/status').send({
        newStatus: 'blocked',
        accountID: '48a5f4aa-7101-472e-aca3-c9b619fb568b',
      });
      expect(response.status).toBe(200);
    });
    it('change status failure, account is not exist', async () => {
      jest
        .spyOn(accountService, 'findOneByCondition')
        .mockResolvedValue(null as Account);
      const response = await test.patch('/accounts/status').send({
        newStatus: 'active',
        accountID: '48a5f4aa-7101-472e-aca3-c9b619fb568b',
      });
      expect(response.status).toBe(400);
    });
    it('change status failure, can not change to inactive', async () => {
      jest
        .spyOn(accountService, 'findOneByCondition')
        .mockResolvedValue(activeAccount);
      const response = await test.patch('/accounts/status').send({
        newStatus: 'inactive',
        accountID: '48a5f4aa-7101-472e-aca3-c9b619fb568b',
      });
      expect(response.status).toBe(400);
    });
    it('change status failure, account was in status', async () => {
      const activeAccount = new Account(
        '',
        '',
        '',
        Role.CUSTOMER,
        AccountStatus.ACTIVE,
      );
      jest
        .spyOn(accountService, 'findOneByCondition')
        .mockResolvedValue(
          new Account('', '', '', Role.SUPERUSER, AccountStatus.ACTIVE),
        );
      const response = await test.patch('/accounts/status').send({
        newStatus: 'active',
        accountID: '48a5f4aa-7101-472e-aca3-c9b619fb568b',
      });
      expect(response.status).toBe(400);
    });
    it('change status failure, cant not change self status', async () => {
      jest
        .spyOn(accountService, 'findOneByCondition')
        .mockResolvedValue(
          new Account(undefined, '', '', Role.CUSTOMER, AccountStatus.ACTIVE),
        );
      const response = await test.patch('/accounts/status').send({
        newStatus: 'inactive',
        accountID: '48a5f4aa-7101-472e-aca3-c9b619fb568b',
      });
      expect(response.status).toBe(400);
    });
  });

  describe('PATCH /accounts/role', () => {
    it('Change role success', async () => {
      const activeAccount = new Account(
        '',
        '',
        '',
        Role.STAFF,
        AccountStatus.ACTIVE,
      );
      jest
        .spyOn(accountService, 'findOneByCondition')
        .mockResolvedValue(activeAccount);
      const response = await test.patch('/accounts/role').send({
        newRole: 'superuser',
        accountID: '48a5f4aa-7101-472e-aca3-c9b619fb568b',
      });
      expect(response.status).toBe(200);
    });

    it('Change role failure, account is not exist', async () => {
      jest
        .spyOn(accountService, 'findOneByCondition')
        .mockResolvedValue(null as Account);
      const response = await test.patch('/accounts/role').send({
        newRole: 'staff',
        accountID: '48a5f4aa-7101-472e-aca3-c9b619fb568b',
      });
      expect(response.status).toBe(400);
    });

    it('Change role failure, role already in role', async () => {
      jest
        .spyOn(accountService, 'findOneByCondition')
        .mockResolvedValue(
          new Account('', '', '', Role.CUSTOMER, AccountStatus.ACTIVE),
        );
      const response = await test.patch('/accounts/role').send({
        newRole: Role.CUSTOMER,
        accountID: '48a5f4aa-7101-472e-aca3-c9b619fb568b',
      });
      expect(response.status).toBe(400);
    });

    it('Change role failure, can not change role of self', async () => {
      jest
        .spyOn(accountService, 'findOneByCondition')
        .mockResolvedValue(
          new Account(undefined, '', '', Role.CUSTOMER, AccountStatus.ACTIVE),
        );
      const response = await test.patch('/accounts/role').send({
        newRole: 'customer',
        accountID: '48a5f4aa-7101-472e-aca3-c9b619fb568b',
      });
      expect(response.status).toBe(400);
    });
  });

  describe('POST /accounts/create', () => {
    it('create account failure, account already exist', async () => {
      jest
        .spyOn(accountService, 'findOneByCondition')
        .mockResolvedValue(activeAccount);
      jest.spyOn(accountService, 'insertAccount').mockResolvedValue();

      const response = await test
        .post('/accounts/create')
        .send({ email: 'test@gmail.com', role: Role.CUSTOMER });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /accounts/information', () => {
    it('get information success', async () => {
      jest
        .spyOn(accountService, 'findOneByCondition')
        .mockResolvedValue(
          new Account('', '', '', Role.CUSTOMER, AccountStatus.ACTIVE),
        );

      const response = await test.get('/accounts/information');
      expect(response.status).toBe(200);
    });

    it('get information failure, account not exist', async () => {
      jest.spyOn(accountService, 'findOneByCondition').mockResolvedValue(null);

      const response = await test.get('/accounts/information');

      expect(response.status).toBe(400);
    });

    it('get information failure, account is not active', async () => {
      jest
        .spyOn(accountService, 'findOneByCondition')
        .mockResolvedValue(
          new Account('', '', '', Role.CUSTOMER, AccountStatus.INACTIVE),
        );
      const response = await test.get('/accounts/information');
      expect(response.status).toBe(400);
    });
  });
});
