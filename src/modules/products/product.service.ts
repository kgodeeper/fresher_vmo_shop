import { HttpStatus, Injectable } from '@nestjs/common';
import { AppHttpException } from '../../exceptions/http.exception';
import { ServiceUtil } from '../../utils/service.utils';
import { DataSource, Repository } from 'typeorm';
import { SuplierService } from '../supliers/suplier.service';
import { AddProductDto } from './product.dto';
import { Product } from './product.entity';
import { Status } from '../../commons/enum.common';
import { CategoryService } from '../categories/category.service';
import { RedisCacheService } from '../caches/cache.service';
import { UploadService } from '../uploads/upload.service';

@Injectable()
export class ProductService extends ServiceUtil<Product, Repository<Product>> {
  constructor(
    private dataSource: DataSource,
    private categoryService: CategoryService,
    private cacheService: RedisCacheService,
    private uploadService: UploadService,
    private suplierService: SuplierService,
  ) {
    super(dataSource.getRepository(Product));
  }

  async addProduct(
    barcode: Express.Multer.File[],
    avatar: Express.Multer.File[],
    productInfo: AddProductDto,
  ): Promise<void> {
    if (await this.checkProductName(productInfo.name)) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        'Product with this name already exist',
      );
    }
    /**
     * add product
     */
    const {
      category,
      suplier,
      name,
      importPrice,
      exportPrice,
      description,
      weight,
    } = productInfo;
    // check suplier is exist ?
    const existSuplier = await this.suplierService.getById(suplier);
    if (!existSuplier) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        'Suplier with this id is not exist',
      );
    }
    if (existSuplier.status !== Status.ACTIVE) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        'Can not add product from inactive suplier',
      );
    }
    // check category is exist ?
    const existCategory = await this.categoryService.getById(category);
    if (!existCategory) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        'Category with this id is not exist',
      );
    }
    if (existCategory.status !== Status.ACTIVE) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        'Can not add product from inactive category',
      );
    }
    const barcodeUploaded = await this.uploadService.uploadToCloudinary(
      barcode[0],
      'products/barcode',
    );
    const avatarUploaded = await this.uploadService.uploadToCloudinary(
      avatar[0],
      `products/${existCategory.name}`,
    );
    const product = new Product(
      existCategory,
      existSuplier,
      name,
      barcodeUploaded.url,
      avatarUploaded.url,
      Number(importPrice),
      Number(exportPrice),
      Number(weight),
      description,
    );
    await this.repository.save(product);
    /**
     * cache quantiy
     */
    await this.cacheService.updateQuantityValue('shop:all:products', 1);
    await this.cacheService.updateQuantityValue('shop:active:products', 1);
  }

  async checkProductName(name: string): Promise<boolean> {
    const existProduct = await this.repository
      .createQueryBuilder()
      .where('LOWER(name) = LOWER(:name)', { name })
      .getOne();
    if (existProduct) return true;
    return false;
  }
}
