import { forwardRef, Module } from '@nestjs/common';
import { RedisCacheModule } from '../caches/cache.module';
import { CustomerModule } from '../customers/customer.module';
import { MailModule } from '../mailer/mail.module';
import { OrderModule } from '../orders/order.module';
import { PaginationModule } from '../paginations/pagination.module';
import { UploadModule } from '../uploads/upload.module';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';

@Module({
  imports: [
    RedisCacheModule,
    MailModule,
    UploadModule,
    PaginationModule,
    forwardRef(() => CustomerModule),
  ],
  exports: [AccountService],
  providers: [AccountService],
  controllers: [AccountController],
})
export class AccountModule {}
