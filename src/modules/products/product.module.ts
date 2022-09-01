import { Module } from '@nestjs/common';
import { RedisCacheModule } from '../caches/cache.module';
import { CategoryModule } from '../categories/category.module';
import { PhotoModule } from '../photos/photo.module';
import { SuplierModule } from '../supliers/suplier.module';
import { UploadModule } from '../uploads/upload.module';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';

@Module({
  imports: [
    SuplierModule,
    CategoryModule,
    UploadModule,
    RedisCacheModule,
    PhotoModule,
  ],
  exports: [ProductService],
  providers: [ProductService],
  controllers: [ProductController],
})
export class ProductModule {}
