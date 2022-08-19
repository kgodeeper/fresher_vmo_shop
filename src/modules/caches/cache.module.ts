import { CacheModule, Module } from '@nestjs/common';
import { CacheConfig } from 'src/configs/cache.config';
import { RedisCacheService } from './cache.service';

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
