import {
  CacheModuleOptions,
  CacheOptionsFactory,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as store from 'cache-manager-redis-store';

@Injectable()
export class RedisCacheConfig implements CacheOptionsFactory {
  constructor(private configService: ConfigService) {}
  createCacheOptions():
    | CacheModuleOptions<Record<string, any>>
    | Promise<CacheModuleOptions<Record<string, any>>> {
    return {
      store,
      host: this.configService.get<string>('REDIS_HOST'),
      port: this.configService.get<string>('REDIS_PORT'),
    };
  }
}
