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

let app: INestApplication;
let testModule: TestingModule;
describe('auths itegration test', () => {
  beforeAll(async () => {
    testModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = testModule.createNestApplication();
    jest
      .spyOn(testModule.get<RedisCacheService>(RedisCacheService), 'get')
      .mockResolvedValue('refresh');
    jest
      .spyOn(testModule.get<RedisCacheService>(RedisCacheService), 'set')
      .mockResolvedValue();
    app.useGlobalInterceptors(new HandleResponseInterceptor());
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('login success', async () => {
    const payload = {
      account: 'testaccount',
      password: 'testpassword',
    };
    jest
      .spyOn(
        testModule.get<AccountService>(AccountService),
        'findOneByCondition',
      )
      .mockResolvedValue({ password: payload.password } as Account);
    jest
      .spyOn(testModule.get<AppJwtService>(AppJwtService), 'signToken')
      .mockResolvedValue('access');
    jest.spyOn(util, 'encrypt').mockResolvedValue(payload.password);
    const response = await request(app.getHttpServer())
      .post('/auths/login')
      .send(payload);
    expect(response.body.accessToken).not.toBeNull();
  });

  describe('POST auths/login', () => {
    it('invalid information', async () => {
      const payload = {
        account: 'kdev17',
        password: 'test',
      };
      const response = await request(app.getHttpServer())
        .post('/auths/login')
        .send(payload);
      expect(response.status).toBe(400);
    });

    it('invalid password', async () => {
      const payload = {
        account: 'testaccount',
        password: 'testpassword',
      };
      jest
        .spyOn(
          testModule.get<AccountService>(AccountService),
          'findOneByCondition',
        )
        .mockResolvedValue({ password: payload.password } as Account);
      jest
        .spyOn(testModule.get<AppJwtService>(AppJwtService), 'signToken')
        .mockResolvedValue('access');
      jest.spyOn(util, 'encrypt').mockResolvedValue(payload.password + 'abc');
      const response = await request(app.getHttpServer())
        .post('/auths/login')
        .send(payload);
      expect(response.status).toBe(400);
    });

    it('invalid username', async () => {
      const payload = {
        account: 'testaccount',
        password: 'testpassword',
      };
      jest
        .spyOn(
          testModule.get<AccountService>(AccountService),
          'findOneByCondition',
        )
        .mockResolvedValue({} as Account);
      jest
        .spyOn(testModule.get<AppJwtService>(AppJwtService), 'signToken')
        .mockResolvedValue('access');
      const response = await request(app.getHttpServer())
        .post('/auths/login')
        .send(payload);
      expect(response.status).toBe(400);
    });

    it('account is not active', async () => {
      const payload = {
        account: 'testaccount',
        password: 'testpassword',
      };
      jest
        .spyOn(
          testModule.get<AccountService>(AccountService),
          'findOneByCondition',
        )
        .mockResolvedValue({
          password: payload.password,
          status: 'inactive',
        } as Account);
      jest
        .spyOn(testModule.get<AppJwtService>(AppJwtService), 'signToken')
        .mockResolvedValue('access');
      jest
        .spyOn(testModule.get<AppJwtService>(AppJwtService), 'signToken')
        .mockResolvedValue('access');
      jest.spyOn(util, 'encrypt').mockResolvedValue(payload.password);
      const response = await request(app.getHttpServer())
        .post('/auths/login')
        .send(payload);
      expect(response.status).toBe(400);
    });
  });

  describe('POST auths/register', () => {
    it('register success', async () => {
      const payload = {
        username: 'testusername',
        password: 'password17',
        email: 'email@gmail.com',
      };
      jest
        .spyOn(
          testModule.get<AccountService>(AccountService),
          'findOneByCondition',
        )
        .mockResolvedValue(null as Account);
      jest
        .spyOn(testModule.get<AccountService>(AccountService), 'createAccount')
        .mockResolvedValue({} as Account);

      jest
        .spyOn(
          testModule.get<AccountService>(AccountService),
          'sendVerifyEmail',
        )
        .mockResolvedValue();
      const response = await request(app.getHttpServer())
        .post('/auths/register')
        .send(payload);
      expect(response.status).toBe(200);
    });

    it('invalid information', async () => {
      const payload = {
        username: 'testusername',
        password: 'test',
        email: 'email',
      };
      const response = await request(app.getHttpServer())
        .post('/auths/register')
        .send(payload);
      expect(response.status).toBe(400);
    });

    it('register failure', async () => {
      const payload = {
        username: 'testusername',
        password: 'password17',
        email: 'email@gmail.com',
      };
      jest
        .spyOn(
          testModule.get<AccountService>(AccountService),
          'findOneByCondition',
        )
        .mockResolvedValue({ username: 'any' } as Account);
      const response = await request(app.getHttpServer())
        .post('/auths/register')
        .send(payload);
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
      jest
        .spyOn(testModule.get<RedisCacheService>(RedisCacheService), 'get')
        .mockResolvedValue('token');
      const response = await request(app.getHttpServer())
        .post('/auths/token')
        .send({ refreshToken: 'refresh' });
      expect(response.status).toBe(400);
    });
  });
});
