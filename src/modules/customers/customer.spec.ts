import { ValidationPipe } from '@nestjs/common';
import { NestApplication } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../app.module';
import { AccountStatus, Gender, Role } from '../../commons/enum.common';
import { AuthGuard } from '../../guards/auth.guard';
import { RoleGuard } from '../../guards/role.guard';
import { HandleResponseInterceptor } from '../../interceptors/handle-response.interceptor';
import { Account } from '../accounts/account.entity';
import { AccountService } from '../accounts/account.service';
import { Customer } from './customer.entity';
import { CustomerService } from './customer.service';
import * as request from 'supertest';

let testModule: TestingModule;
let app: NestApplication;
let customerService: CustomerService;
let accountService: AccountService;
let test;
const activeAccount = new Account(
  'supertest',
  'supertest',
  'stest@gmail.com',
  Role.CUSTOMER,
  AccountStatus.ACTIVE,
);
const inactiveAccount = new Account(
  'supertest',
  'supertest',
  'stest@gmail.com',
  Role.CUSTOMER,
  AccountStatus.INACTIVE,
);
const existCustomer = new Customer(
  'supertest',
  new Date('2000-11-17'),
  Gender.MALE,
  activeAccount,
);
describe('Customer integration test', () => {
  beforeAll(async () => {
    testModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RoleGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();
    customerService = testModule.get<CustomerService>(CustomerService);
    accountService = testModule.get<AccountService>(AccountService);
    app = testModule.createNestApplication();
    app.useGlobalInterceptors(new HandleResponseInterceptor());
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
    test = request(app.getHttpServer());
  });

  describe('PUT /customers/information', () => {
    it('update information success', async () => {
      jest
        .spyOn(accountService, 'findOneByCondition')
        .mockResolvedValue(activeAccount);

      jest
        .spyOn(customerService, 'findOneAndJoin')
        .mockResolvedValue(existCustomer);

      jest.spyOn(customerService, 'upsertCustomer').mockResolvedValue();

      const response = await test.put('/customers/update').send({
        fullname: 'Some name',
        dob: '2000-11-17',
        gender: Gender.MALE,
      });

      expect(response.status).toBe(200);
    });

    it('update information failure, nothing to update', async () => {
      const response = await test.put('/customers/update').send({});
      expect(response.status).toBe(400);
    });

    it('update information failure, account is not active', async () => {
      jest
        .spyOn(accountService, 'findOneByCondition')
        .mockResolvedValue(inactiveAccount);

      jest
        .spyOn(customerService, 'findOneAndJoin')
        .mockResolvedValue(existCustomer);

      jest.spyOn(customerService, 'upsertCustomer').mockResolvedValue();

      const response = await test.put('/customers/update').send({
        fullname: 'Some name',
        dob: '2000-11-17',
        gender: Gender.MALE,
      });

      expect(response.status).toBe(400);
    });

    it('update information success, customer is not exist', async () => {
      jest
        .spyOn(accountService, 'findOneByCondition')
        .mockResolvedValue(activeAccount);

      jest.spyOn(customerService, 'findOneAndJoin').mockResolvedValue(null);

      jest.spyOn(customerService, 'upsertCustomer').mockResolvedValue();

      const response = await test.put('/customers/update').send({
        fullname: 'Some name',
        dob: '2000-11-17',
        gender: Gender.MALE,
      });

      expect(response.status).toBe(200);
    });
  });

  describe('GET /customers', () => {
    it('get information success, full information', async () => {
      jest
        .spyOn(accountService, 'findOneByCondition')
        .mockResolvedValue(activeAccount);

      jest
        .spyOn(customerService, 'findOneAndJoin')
        .mockResolvedValue(existCustomer);

      const response = await test.get('/customers');
      expect(response.status).toBe(200);
    });

    it('get information success, no information', async () => {
      jest
        .spyOn(accountService, 'findOneByCondition')
        .mockResolvedValue(activeAccount);

      jest.spyOn(customerService, 'findOneAndJoin').mockResolvedValue(null);

      const response = await test.get('/customers');
      expect(response.status).toBe(200);
    });

    it('get information failure, account is not active', async () => {
      jest
        .spyOn(accountService, 'findOneByCondition')
        .mockResolvedValue(inactiveAccount);

      jest.spyOn(customerService, 'findOneAndJoin').mockResolvedValue(null);

      const response = await test.get('/customers');
      expect(response.status).toBe(400);
    });
  });
});
