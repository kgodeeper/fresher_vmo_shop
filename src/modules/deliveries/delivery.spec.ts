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
import { Customer } from '../customers/customer.entity';
import { CustomerService } from '../customers/customer.service';
import { DeliveryService } from './delivery.service';
import * as request from 'supertest';

let testModule: TestingModule;
let app: NestApplication;
let accountService: AccountService;
let customerService: CustomerService;
let deliveryService: DeliveryService;
let test;
const address = {
  phone: '0373698822',
  receiver: 'supertest',
  homeAddress: 'address',
  district: 'disctrict',
  province: 'province',
};
describe('Delivery integration test', () => {
  beforeAll(async () => {
    testModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RoleGuard)
      .useValue({ canActivate: () => true })
      .compile();
    accountService = testModule.get<AccountService>(AccountService);
    customerService = testModule.get<CustomerService>(CustomerService);
    deliveryService = testModule.get<DeliveryService>(DeliveryService);
    app = testModule.createNestApplication();
    app.useGlobalInterceptors(new HandleResponseInterceptor());
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
    test = request(app.getHttpServer());
  });

  describe('POST /deliveries', () => {
    it('Create address success', async () => {
      jest
        .spyOn(accountService, 'findOneByCondition')
        .mockResolvedValue(
          new Account('', '', '', Role.CUSTOMER, AccountStatus.ACTIVE),
        );
      jest
        .spyOn(customerService, 'findOneByCondition')
        .mockResolvedValue(
          new Customer('', '', Gender.FEMALE, null as Account),
        );
      jest.spyOn(deliveryService, 'countCustomerDelivery').mockResolvedValue(0);
      jest.spyOn(deliveryService, 'saveDelivery').mockResolvedValue();

      const response = await test.post('/deliveries').send(address);
      expect(response.status).toBe(200);
    });

    it('Create address failure, account is not exist', async () => {
      jest
        .spyOn(accountService, 'findOneByCondition')
        .mockResolvedValue(null as Account);
      const response = await test.post('/deliveries').send(address);
      expect(response.status).toBe(400);
    });
  });
});
