import { Module } from '@nestjs/common';
import { AccountModule } from '../accounts/account.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MailModule } from '../mailer/mailer.module';
import { JWTModule } from '../jwts/jwt.module';
import { JoiPipeModule } from 'nestjs-joi';

@Module({
  imports: [AccountModule, MailModule, JWTModule, JoiPipeModule],
  exports: [],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
