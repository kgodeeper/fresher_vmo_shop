import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtConfig } from 'src/configs/jwt.config';
import { RedisCacheModule } from '../caches/cache.module';
import { AccountModule } from '../accounts/account.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MailModule } from '../mailer/mailer.module';
import { JWTModule } from '../jwts/jwt.module';

@Module({
  imports: [AccountModule, RedisCacheModule, MailModule, JWTModule],
  exports: [],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
