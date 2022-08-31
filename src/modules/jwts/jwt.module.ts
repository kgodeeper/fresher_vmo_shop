import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtConfig } from '../../configs/jwt.config';
import { AppJwtService } from './jwt.service';

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      useClass: JwtConfig,
    }),
  ],
  providers: [AppJwtService],
  exports: [AppJwtService],
})
export class AppJwtModule {}
