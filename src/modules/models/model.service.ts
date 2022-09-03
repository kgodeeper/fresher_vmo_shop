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

  async getAllQuantityInStock(id: string): Promise<number> {
    const result = await this.repository
      .createQueryBuilder('model')
      .leftJoinAndSelect('model.fkProduct', 'product')
      .where('model."fkProduct" = :product', {
        product: id,
      })
      .select('SUM(model."quantityInStock")')
      .getRawOne();
    return result.sum;
  }

  async checkModel(modelInfo: {
    modelId: string;
    quantity: number;
  }): Promise<ProductModel> {
    const existModel = await this.findOneAndJoin(
      { fkProduct: true },
      {
        pkProductModel: modelInfo.modelId,
      },
    );
    if (!existModel) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        `Product model with id ${modelInfo.modelId} is not exist`,
      );
    }
    if (existModel.quantityInStock < modelInfo.quantity) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        `This model is out of stock`,
      );
    }
    return existModel;
  }
}
