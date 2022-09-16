import { CacheModule, Module } from '@nestjs/common';
import { RedisCacheModule } from '../caches/cache.module';
import { PaginationModule } from '../paginations/pagination.module';
import { UploadModule } from '../uploads/upload.module';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';

@Module({
  imports: [UploadModule, RedisCacheModule, PaginationModule],
  exports: [CategoryService],
  providers: [CategoryService],
  controllers: [CategoryController],
})
export class CategoryModule {}
