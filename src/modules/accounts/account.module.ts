import { Module } from '@nestjs/common';
import { RedisCacheModule } from '../caches/cache.module';
import { MailModule } from '../mailer/mail.module';
import { UploadModule } from '../uploads/upload.module';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';

@Module({
  imports: [RedisCacheModule, MailModule, UploadModule],
  exports: [AccountService],
  providers: [AccountService],
  controllers: [AccountController],
})
export class AccountModule {}
