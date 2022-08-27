import { CACHE_MANAGER, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { AppHttpException } from '../exceptions/http.exceptions';

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

  async keys(pattern: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.cache.keys(pattern, (err, keys: string[]) => {
        if (err) reject(err);
        else resolve(keys);
      });
    });
  }

  async changeValue(key, delta, ttl): Promise<any> {
    try {
      const current = Number(await this.cache.get(key)) + delta;
      if (ttl === Infinity) ttl = 31536000;
      await this.cache.set(key, current, { ttl });
    } catch {
      throw new AppHttpException(HttpStatus.BAD_REQUEST, 'Bad request');
    }
  }
}
