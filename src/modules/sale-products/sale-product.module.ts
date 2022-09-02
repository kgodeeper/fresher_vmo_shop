import { Module } from '@nestjs/common';
import { ProductModelModule } from '../models/model.module';
import { ProductModelService } from '../models/model.service';
import { ProductModule } from '../products/product.module';
import { SaleModule } from '../sales/sale.module';
import { SaleProductController } from './sale-product.controller';
import { SaleProductService } from './sale-product.service';

@Module({
  imports: [ProductModule, SaleModule, ProductModelModule],
  exports: [SaleProductService],
  providers: [SaleProductService],
  controllers: [SaleProductController],
})
export class SaleProductModule {}
