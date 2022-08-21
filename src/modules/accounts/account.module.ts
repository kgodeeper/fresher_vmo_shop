import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisCacheModule } from '../caches/cache.module';
import { MailModule } from '../mailer/mailer.module';
import { UserController } from './account.controller';
import { Account } from './account.entity';
import { AccountService } from './account.service';

@Module({
  providers: [AccountService],
  imports: [TypeOrmModule.forFeature([Account]), RedisCacheModule, MailModule],
  controllers: [UserController],
  exports: [AccountService],
})
export class AccountModule {}
