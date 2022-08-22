import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtConfig } from 'src/configs/jwt.config';
import { JWTService } from './jwt.service';

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      useClass: JwtConfig,
    }),
  ],
  providers: [JWTService],
  exports: [JWTService],
})
export class JWTModule {}
