import { CacheModule, Global, Module } from '@nestjs/common';
import { CacheConfig } from 'src/configs/cache.config';
import { RedisCacheService } from './cache.service';

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      useClass: CacheConfig,
    }),
  ],
  providers: [RedisCacheService],
  exports: [RedisCacheService],
})
export class RedisCacheModule {}
