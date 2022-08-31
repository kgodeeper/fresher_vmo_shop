import { CacheModule, Global, Module } from '@nestjs/common';
import { RedisCacheConfig } from '../../configs/cache.config';
import { RedisCacheService } from './cache.service';

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      useClass: RedisCacheConfig,
    }),
  ],
  exports: [RedisCacheService],
  providers: [RedisCacheService],
})
export class RedisCacheModule {}
