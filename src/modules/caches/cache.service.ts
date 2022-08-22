import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
@Injectable()
export class RedisCacheService {
  constructor(
    @Inject(CACHE_MANAGER)
    private cache: Cache,
  ) {}

  async get(key: string): Promise<string> {
    return await this.cache.get(key);
  }

  async set(
    key: string,
    value: string | object,
    timeToLive: number,
  ): Promise<void> {
    if (typeof value === 'object') {
      await this.cache.set(key, JSON.stringify(value), { ttl: timeToLive });
    } else
      await this.cache.set(key, value, {
        ttl: timeToLive,
      });
  }

  async delete(key: string): Promise<void> {
    await this.cache.del(key);
  }
}
