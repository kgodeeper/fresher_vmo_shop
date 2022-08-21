import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisCacheModule } from '../caches/cache.module';
import { JWTModule } from '../jwts/jwt.module';
import { MailModule } from '../mailer/mailer.module';
import { UserController } from './account.controller';
import { Account } from './account.entity';
import { JoiPipeModule } from 'nestjs-joi';
import { AccountService } from './account.service';

@Module({
  providers: [AccountService],
  imports: [
    TypeOrmModule.forFeature([Account]),
    RedisCacheModule,
    MailModule,
    JWTModule,
    JoiPipeModule,
  ],
  controllers: [UserController],
  exports: [AccountService],
})
export class AccountModule {}
