import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class RedisCacheService {
  constructor(
    @Inject(CACHE_MANAGER)
    private cache: Cache,
  ) {}

  async get(key: string): Promise<any> {
    return await this.cache.get(key);
  }

  async set(key: string, value: string, timeToLive: number): Promise<any> {
    try {
      await this.cache.set(key, value, {
        ttl: timeToLive,
      });
    } catch (error) {
      console.log(error);
    }
  }
}
