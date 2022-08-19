import {
  CacheModuleOptions,
  CacheOptionsFactory,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as cacheStore from 'cache-manager-redis-store';

@Injectable()
export class CacheConfig implements CacheOptionsFactory {
  constructor(private configService: ConfigService) {}
  createCacheOptions():
    | CacheModuleOptions<Record<string, any>>
    | Promise<CacheModuleOptions<Record<string, any>>> {
    return {
      store: cacheStore,
      host: this.configService.get<string>('REDISHOST'),
      port: this.configService.get<number>('REDISPORT'),
    };
  }
}
