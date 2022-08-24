import { Module } from '@nestjs/common';
import { AccountModule } from '../accounts/account.module';
import { CustomerModule } from '../customers/customer.module';
import { DeliveryController } from './delivery.controller';
import { DeliveryService } from './delivery.service';

@Module({
  imports: [AccountModule, CustomerModule],
  exports: [],
  providers: [DeliveryService],
  controllers: [DeliveryController],
})
export class DeliveryModule {}
