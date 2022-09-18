import { HttpStatus, Injectable } from '@nestjs/common';
import { ServiceUtil } from '../../utils/service.utils';
import { DataSource, Repository } from 'typeorm';
import { AddSaleProductDto } from './sale-product.dto';
import { SaleProduct } from './sale-product.entity';
import { ProductService } from '../products/product.service';
import { SaleService } from '../sales/sale.service';
import { AppHttpException } from '../../exceptions/http.exception';
import { ProductModelService } from '../models/model.service';
import {
  getAllForceOptions,
  getAllJoinOptions,
  IPaginate,
  IPagination,
} from 'src/utils/interface.util';
import {
  combineFilter,
  combineSearch,
  combineSort,
} from '../../utils/string.util';
import { PaginationService } from '../paginations/pagination.service';

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
    private paginationService: PaginationService<SaleProduct>,
  ) {
    super(dataSource.getRepository(SaleProduct));
  }

  async addSaleProduct(saleProductInfo: AddSaleProductDto): Promise<void> {
    const { product, sale, total, discount } = saleProductInfo;
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
    if (Number(discount) > existProduct.exportPrice) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        'Discount can not be greater than export price',
      );
    }
    const saleProduct = new SaleProduct(
      existSale,
      existProduct,
      Number(total),
      Number(discount),
    );
    saleProduct.salePrice = existProduct.exportPrice - saleProduct.discount;
    await this.repository.save(saleProduct);
  }

  async getCurrentSaleProduct(
    saleId: string,
    page: number,
    pLimit: string,
    search: string,
    sort: string,
    filter: string,
  ): Promise<IPagination<SaleProduct>> {
    if (page <= 0) page = 1;
    let limit = 25;
    if (Number(pLimit) !== NaN && Number(pLimit) >= 0) limit = Number(pLimit);
    const force: getAllForceOptions = {
      forces: [
        {
          column: 'fkSale',
          condition: saleId,
        },
      ],
    };
    const join: getAllJoinOptions = {
      rootName: 'product_sale',
      joinColumns: [
        {
          column: 'product_sale.fkProduct',
          optional: 'product',
        },
      ],
    };
    let totals = [];
    try {
      totals = await this.getAlls(search, sort, filter, force, join);
      totals = totals.map((item) => {
        delete item.fkProduct.importPrice;
        return item;
      });
    } catch {}
    const total = totals.length;
    const elements = totals.splice((page - 1) * limit, page * limit);
    this.paginationService.setPrefix(`sale-products/${saleId}`);
    return this.paginationService.getResponseObject(
      elements,
      total,
      page,
      limit,
      search,
      sort,
      filter,
      null,
    );
  }
}
