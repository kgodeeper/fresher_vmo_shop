import { Module } from '@nestjs/common';
import { CategoryModule } from '../categories/category.module';
import { PictureModule } from '../pictures/picture.module';
import { SuplierModule } from '../supliers/suplier.module';
import { UploadModule } from '../uploads/upload.module';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';

@Module({
  imports: [UploadModule, PictureModule, CategoryModule, SuplierModule],
  exports: [ProductService],
  providers: [ProductService],
  controllers: [ProductController],
})
export class ProductModule {}
