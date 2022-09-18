import { CacheModule, forwardRef, Module } from '@nestjs/common';
import { RedisCacheModule } from '../caches/cache.module';
import { ProductModel } from '../models/model.entity';
import { PaginationModule } from '../paginations/pagination.module';
import { ProductModule } from '../products/product.module';
import { UploadModule } from '../uploads/upload.module';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';

@Module({
  imports: [
    UploadModule,
    RedisCacheModule,
    PaginationModule,
    forwardRef(() => ProductModule),
  ],
  exports: [CategoryService],
  providers: [CategoryService],
  controllers: [CategoryController],
})
export class CategoryModule {}
