import { Module } from '@nestjs/common';
import { AccountModule } from '../accounts/account.module';
import { AccountService } from '../accounts/account.service';
import { CustomerModule } from '../customers/customer.module';
import { CustomerService } from '../customers/customer.service';
import { DeliveryController } from './delivery.controller';
import { DeliveryService } from './delivery.service';

@Module({
  imports: [CustomerModule, AccountModule],
  exports: [DeliveryService],
  providers: [DeliveryService],
  controllers: [DeliveryController],
})
export class DeliveryModule {}
