import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { json } from 'stream/consumers';

@Injectable()
export class RedisCacheService {
  constructor(
    @Inject(CACHE_MANAGER)
    private cache: Cache,
  ) {}

  async get(key: string): Promise<any> {
    return await this.cache.get(key);
  }

  async set(
    key: string,
    value: string | object,
    timeToLive: number,
  ): Promise<any> {
    if (typeof value === 'object') {
      await this.cache.set(key, JSON.stringify(value), { ttl: timeToLive });
    } else
      await this.cache.set(key, value, {
        ttl: timeToLive,
      });
  }

  async getJson(key: string): Promise<object> {
    const jsonstr = await this.cache.get(key);
    return JSON.parse(jsonstr);
  }

  async delete(key: string): Promise<void> {
    await this.cache.set(key, '', { ttl: 0 });
  }
}
