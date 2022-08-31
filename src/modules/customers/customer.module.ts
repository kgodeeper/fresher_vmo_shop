import { Module } from '@nestjs/common';
import { AccountModule } from '../accounts/account.module';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';

@Module({
  imports: [AccountModule],
  exports: [CustomerService],
  providers: [CustomerService],
  controllers: [CustomerController],
})
export class CustomerModule {}
