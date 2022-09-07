import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as util from '../../utils/string.util';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { Account } from '../accounts/account.entity';
import { AccountService } from '../accounts/account.service';
import { RedisCacheService } from '../caches/cache.service';
import { AppJwtService } from '../jwts/jwt.service';
import { HandleResponseInterceptor } from '../../interceptors/handle-response.interceptor';
import { AuthGuard } from '../../guards/auth.guard';
import { AccountStatus, Role } from '../../commons/enum.common';

let app: INestApplication;
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

describe('auths itegration test', () => {
  beforeAll(async () => {
    testModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    accountService = testModule.get<AccountService>(AccountService);
    // mock common service
    jest
      .spyOn(testModule.get<RedisCacheService>(RedisCacheService), 'get')
      .mockResolvedValue('refresh');
    jest
      .spyOn(testModule.get<RedisCacheService>(RedisCacheService), 'set')
      .mockResolvedValue();
    jest
      .spyOn(testModule.get<AppJwtService>(AppJwtService), 'signToken')
      .mockResolvedValue('fake_token');
    jest.spyOn(accountService, 'sendVerifyEmail').mockResolvedValue();
    // use global component
    app = testModule.createNestApplication();
    app.useGlobalInterceptors(new HandleResponseInterceptor());
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST auths/login', () => {
    it('login success', async () => {
      const loginInfo = {
        account: 'supertest',
        password: 'supertest1',
      };
      jest
        .spyOn(accountService, 'findOneByCondition')
        .mockResolvedValue(activeAccount);
      jest.spyOn(util, 'encrypt').mockResolvedValue(loginInfo.password);

      const response = await request(app.getHttpServer())
        .post('/auths/login')
        .send(loginInfo);
      expect(response.status).toBe(200);
    });

    it('login failure, invalid information', async () => {
      const loginInfo = {
        password: 'supertest1',
      };
      const response = await request(app.getHttpServer())
        .post('/auths/login')
        .send(loginInfo);
      expect(response.status).toBe(400);
    });

    it('login failure, invalid password', async () => {
      const loginInfo = {
        account: 'supertest',
        password: 'supertest2',
      };
      jest
        .spyOn(accountService, 'findOneByCondition')
        .mockResolvedValue(activeAccount);
      jest.spyOn(util, 'encrypt').mockResolvedValue(loginInfo.password);
      const response = await request(app.getHttpServer())
        .post('/auths/login')
        .send(loginInfo);
      expect(response.status).toBe(400);
    });

    it('login failure, invalid username', async () => {
      const payload = {
        account: 'supertest1',
        password: 'supertest2',
      };
      jest
        .spyOn(accountService, 'findOneByCondition')
        .mockResolvedValue(null as Account);
      const response = await request(app.getHttpServer())
        .post('/auths/login')
        .send(payload);
      expect(response.status).toBe(400);
    });

    it('login failure, account is not active', async () => {
      const payload = {
        account: 'supertest',
        password: 'supertest1',
      };
      jest
        .spyOn(accountService, 'findOneByCondition')
        .mockResolvedValue(inactiveAccount);
      const response = await request(app.getHttpServer())
        .post('/auths/login')
        .send(payload);
      expect(response.status).toBe(400);
    });
  });

  describe('POST auths/register', () => {
    const registerInfo = {
      username: 'supertest',
      password: 'supertest1',
      email: 'test@gmail.com',
    };
    it('register success', async () => {
      jest
        .spyOn(accountService, 'findOneByCondition')
        .mockResolvedValue(null as Account);
      jest.spyOn(accountService, 'createAccount').mockResolvedValue(null);
      const response = await request(app.getHttpServer())
        .post('/auths/register')
        .send(registerInfo);
      expect(response.status).toBe(200);
    });

    it('invalid information', async () => {
      const registerInfo = {
        username: 'supertest',
        email: 'email',
      };
      const response = await request(app.getHttpServer())
        .post('/auths/register')
        .send(registerInfo);
      expect(response.status).toBe(400);
    });

    it('register failure, account already exist', async () => {
      const registerInfo = {
        username: 'testusername',
        password: 'password17',
        email: 'email@gmail.com',
      };
      jest
        .spyOn(accountService, 'findOneByCondition')
        .mockResolvedValue(activeAccount);
      const response = await request(app.getHttpServer())
        .post('/auths/register')
        .send(registerInfo);
      expect(response.status).toBe(400);
    });
  });

  describe('POST /token', () => {
    it('Get access token success', async () => {
      jest
        .spyOn(testModule.get<AuthGuard>(AuthGuard), 'canActivate')
        .mockResolvedValue(true);
      jest
        .spyOn(testModule.get<AppJwtService>(AppJwtService), 'verifyToken')
        .mockResolvedValue({ username: 'testusername' });
      jest
        .spyOn(testModule.get<RedisCacheService>(RedisCacheService), 'get')
        .mockResolvedValue('token');
      const response = await request(app.getHttpServer())
        .post('/auths/token')
        .send({ refreshToken: 'token' });
      expect(response.status).toBe(200);
    });

    it('Get access token failure, token invalid', async () => {
      jest
        .spyOn(testModule.get<AppJwtService>(AppJwtService), 'verifyToken')
        .mockResolvedValue({ username: 'testusername' });
      const response = await request(app.getHttpServer())
        .post('/auths/token')
        .send({ refreshToken: 'refresh' });
      expect(response.status).toBe(400);
    });
  });
});
