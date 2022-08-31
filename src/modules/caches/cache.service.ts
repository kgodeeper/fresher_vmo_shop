import { CACHE_MANAGER, Global, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';

@Injectable()
export class RedisCacheService {
  constructor(
    @Inject(CACHE_MANAGER)
    private cache: Cache,
    private configService: ConfigService,
  ) {}

  async get(key: string): Promise<string> {
    return this.cache.get(key);
  }

  async set(key: string, value: string, ttl: number): Promise<void> {
    this.cache.set(key, value, { ttl });
  }

  async del(key: string): Promise<void> {
    this.cache.del(key);
  }

  async keys(pattern: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      this.cache.keys(pattern, (err, keys: string[]) => {
        if (err) reject(err);
        else resolve(keys);
      });
    });
  }

  async updateQuantityValue(key: string, delta: number) {
    const newVal = Number(await this.get(key)) + delta;
    this.set(
      key,
      String(newVal),
      this.configService.get<number>('INFINITY_TTL'),
    );
  }

  async destroyAllKeys(pattern: string): Promise<void> {
    const keys = await this.keys(pattern);
    for (let i = 0; i < keys.length; i++) {
      await this.del(keys[i]);
    }
  }
}
