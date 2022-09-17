import { Global, Module } from '@nestjs/common';
import { GoogleAuthService } from './google-auth.service';

@Global()
@Module({
  imports: [],
  exports: [GoogleAuthService],
  providers: [GoogleAuthService],
})
export class GoogleAuthModule {}
