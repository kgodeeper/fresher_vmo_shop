import { Module } from '@nestjs/common';
import { ProductModelModule } from '../models/model.module';
import { PaginationModule } from '../paginations/pagination.module';
import { ProductModule } from '../products/product.module';
import { SaleModule } from '../sales/sale.module';
import { SaleProductController } from './sale-product.controller';
import { SaleProductService } from './sale-product.service';

@Module({
  imports: [ProductModule, SaleModule, ProductModelModule, PaginationModule],
  exports: [SaleProductService],
  providers: [SaleProductService],
  controllers: [SaleProductController],
})
export class SaleProductModule {}
