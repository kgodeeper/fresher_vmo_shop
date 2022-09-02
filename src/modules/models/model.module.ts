import { Module } from '@nestjs/common';
import { ProductModule } from '../products/product.module';
import { ProductModelController } from './model.controller';
import { ProductModelService } from './model.service';

@Module({
  imports: [ProductModule],
  exports: [ProductModelService],
  providers: [ProductModelService],
  controllers: [ProductModelController],
})
export class ProductModelModule {}
