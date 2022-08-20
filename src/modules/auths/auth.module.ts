import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtConfig } from 'src/configs/jwt.config';
import { RedisCacheModule } from '../caches/cache.module';
import { AccountModule } from '../accounts/account.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    AccountModule,
    RedisCacheModule,
    JwtModule.registerAsync({
      useClass: JwtConfig,
    }),
  ],
  exports: [],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
