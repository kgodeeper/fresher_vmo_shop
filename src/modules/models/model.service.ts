import { HttpStatus, Injectable } from '@nestjs/common';
import { ServiceUtil } from '../../utils/service.utils';
import { DataSource, Repository } from 'typeorm';
import { AddProductModelDto, UpdateProductModelDto } from './model.dto';
import { ProductModel } from './model.entity';
import { ProductService } from '../products/product.service';
import { AppHttpException } from '../../exceptions/http.exception';
import { Status } from '../../commons/enum.common';

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
    const { memory, color, quantityInStock } = modelInfo;
    const model = new ProductModel(
      memory,
      color,
      Number(quantityInStock),
      existProduct,
    );
    /**
     * check model is exist ?
     */
    const existModel = await this.findOneByCondition({
      memory,
      color,
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
    if (existModel.status !== Status.ACTIVE) {
      throw new AppHttpException(HttpStatus.BAD_REQUEST, 'Model was remove');
    }
    return existModel;
  }

  async getProductIdByModel(id: string): Promise<string> {
    const existModel = await this.findOneAndJoin(
      { fkProduct: true },
      { pkProductModel: id },
    );
    if (!existModel) {
      throw new AppHttpException(HttpStatus.BAD_REQUEST, 'Model is not exist');
    }
    if (existModel.status !== Status.ACTIVE) {
      throw new AppHttpException(HttpStatus.BAD_REQUEST, 'Model was remove');
    }
    return existModel.fkProduct.pkProduct;
  }

  async updateProductModel(
    modelId: string,
    modelInfo: UpdateProductModelDto,
  ): Promise<void> {
    const existModel = await this.getExistModel(modelId);
    const { color, memory, quantityInStock } = modelInfo;
    existModel.updateModel(
      color,
      memory,
      quantityInStock ? Number(quantityInStock) : undefined,
    );
    await existModel.save();
  }

  async getExistModel(modelId: string): Promise<ProductModel> {
    const existModel = await this.findOneByCondition({
      pkProductModel: modelId,
    });
    if (!existModel) {
      throw new AppHttpException(HttpStatus.BAD_REQUEST, 'Model is not exist');
    }
    if (existModel.status === Status.INACTIVE) {
      throw new AppHttpException(HttpStatus.BAD_REQUEST, 'Model was removed');
    }
    return existModel;
  }

  async changeModelStatus(modelId: string): Promise<void> {
    const existModel = await this.findOneByCondition({
      pkProductModel: modelId,
    });
    if (!existModel) {
      throw new AppHttpException(HttpStatus.BAD_REQUEST, 'Model is not exist');
    }
    if (existModel.status === Status.ACTIVE) {
      existModel.status = Status.INACTIVE;
    } else {
      existModel.status = Status.ACTIVE;
    }
    await existModel.save();
  }

  async returnQuantity(modelId: string, quantity: number): Promise<void> {
    const existModel = await this.findOneByCondition({
      pkProductModel: modelId,
    });
    existModel.quantityInStock += quantity;
    await existModel.save();
  }
}
