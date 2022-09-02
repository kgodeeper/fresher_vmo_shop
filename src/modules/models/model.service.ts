import { HttpStatus, Injectable } from '@nestjs/common';
import { ServiceUtil } from '../../utils/service.utils';
import { DataSource, Repository } from 'typeorm';
import { AddProductModelDto } from './model.dto';
import { ProductModel } from './model.entity';
import { ProductService } from '../products/product.service';
import { AppHttpException } from '../../exceptions/http.exception';

@Injectable()
export class ProductModelService extends ServiceUtil<
  ProductModel,
  Repository<ProductModel>
> {
  constructor(
    private dataSource: DataSource,
    private productService: ProductService,
  ) {
    super(dataSource.getRepository(ProductModel));
  }

  async addProductModel(modelInfo: AddProductModelDto): Promise<void> {
    const existProduct = await this.productService.getExistProduct(
      modelInfo.product,
    );
    const { memory, screen, os, color, quantityInStock, battery } = modelInfo;
    const model = new ProductModel(
      memory,
      screen,
      os,
      color,
      Number(quantityInStock),
      battery,
      existProduct,
    );
    /**
     * check model is exist ?
     */
    const existModel = await this.findOneByCondition({
      memory,
      screen,
      os,
      color,
      battery,
    });
    if (existModel && existModel.fkProduct === existProduct) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        `Product model already exist`,
      );
    }
    /**
     *
     */
    await this.repository.save(model);
  }
}
