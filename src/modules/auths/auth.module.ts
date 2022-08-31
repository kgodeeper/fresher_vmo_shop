import { Module } from '@nestjs/common';
import { AccountModule } from '../accounts/account.module';
import { RedisCacheModule } from '../caches/cache.module';
import { AppJwtModule } from '../jwts/jwt.module';
import { MailModule } from '../mailer/mail.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [AccountModule, RedisCacheModule, MailModule, AppJwtModule],
  exports: [],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
