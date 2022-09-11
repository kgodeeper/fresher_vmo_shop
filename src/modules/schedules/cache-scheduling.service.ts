import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Status } from '../../commons/enum.common';
import { AccountService } from '../accounts/account.service';
import { RedisCacheService } from '../caches/cache.service';
import { CategoryService } from '../categories/category.service';
import { ProductService } from '../products/product.service';

@Injectable()
export class CacheSchedulingService {
  constructor(
    private accountService: AccountService,
    private categoryService: CategoryService,
    private productService: ProductService,
    private cacheService: RedisCacheService,
    private configService: ConfigService,
  ) {}
  @Cron(CronExpression.EVERY_30_SECONDS)
  async updateCache(): Promise<void> {
    const ttl = this.configService.get<number>('INFINITY_TTL');
    const allAccounts = await this.accountService.countAllByCondition({});
    const allCategories = await this.categoryService.countAllByCondition({});
    const activeCategories = await this.categoryService.countAllByCondition({
      status: Status.ACTIVE,
    });
    const allProducts = await this.productService.countAllByCondition({});
    const activeProducts = await this.productService.countAllByCondition({
      status: Status.ACTIVE,
    });
    await this.cacheService.set(
      'shop:all:accounts',
      allAccounts.toString(),
      ttl,
    );
    await this.cacheService.set(
      'shop:all:categories',
      allCategories.toString(),
      ttl,
    );
    await this.cacheService.set(
      'shop:active:categories',
      activeCategories.toString(),
      ttl,
    );
    await this.cacheService.set(
      'shop:all:products',
      allProducts.toString(),
      ttl,
    );
    await this.cacheService.set(
      'shop:active:products',
      activeProducts.toString(),
      ttl,
    );
  }
}
