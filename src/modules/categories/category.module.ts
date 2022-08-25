import { Module } from '@nestjs/common';
import { UploadModule } from '../uploads/upload.module';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';

@Module({
  imports: [UploadModule],
  exports: [CategoryService],
  providers: [CategoryService],
  controllers: [CategoryController],
})
export class CategoryModule {}
