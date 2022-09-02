import { HttpStatus, Injectable } from '@nestjs/common';
import { ServiceUtil } from '../../utils/service.utils';
import { DataSource, Repository } from 'typeorm';
import { AddSaleProductDto } from './sale-product.dto';
import { SaleProduct } from './sale-product.entity';
import { ProductService } from '../products/product.service';
import { SaleService } from '../sales/sale.service';
import { AppHttpException } from '../../exceptions/http.exception';
import { ProductModelService } from '../models/model.service';

@Injectable()
export class SaleProductService extends ServiceUtil<
  SaleProduct,
  Repository<SaleProduct>
> {
  constructor(
    private dataSource: DataSource,
    private saleService: SaleService,
    private modelService: ProductModelService,
    private productService: ProductService,
  ) {
    super(dataSource.getRepository(SaleProduct));
  }

  async addSaleProduct(saleProductInfo: AddSaleProductDto): Promise<void> {
    const { product, sale, total } = saleProductInfo;
    /**
     * check product
     */
    const existProduct = await this.productService.getExistProduct(product);
    const existSale = await this.saleService.getExistSale(sale);
    if (new Date(existSale.end) < new Date()) {
      throw new AppHttpException(HttpStatus.BAD_REQUEST, 'Sale was end');
    }
    /**
     * get total quantity in stock of product
     */
    const quantityInStock = await this.modelService.getAllQuantityInStock(
      existProduct.pkProduct,
    );
    /**
     * check sale quantity
     */
    if (Number(total) > quantityInStock) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        'Quantity is greater than total quantity in stock of product',
      );
    }
    /**
     * check sale product already exist
     */
    const existSaleProduct = await this.findOneAndJoin(
      { fkSale: true, fkProduct: true },
      {
        fkProduct: { pkProduct: existProduct.pkProduct },
        fkSale: { pkSale: existSale.pkSale },
      },
    );
    if (existSaleProduct) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        'Product already exist in this sale',
      );
    }
    const saleProduct = new SaleProduct(existSale, existProduct, Number(total));
    await this.repository.save(saleProduct);
  }
}
