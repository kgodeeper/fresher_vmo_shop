import { Module } from '@nestjs/common';
import { AccountModule } from '../accounts/account.module';
import { UploadModule } from '../uploads/upload.module';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';

@Module({
  imports: [UploadModule, AccountModule],
  exports: [CustomerService],
  controllers: [CustomerController],
  providers: [CustomerService],
})
export class CustomerModule {}
