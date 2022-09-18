import { forwardRef, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { AppHttpException } from '../../exceptions/http.exception';
import { ServiceUtil } from '../../utils/service.utils';
import { DataSource, Repository } from 'typeorm';
import { SuplierService } from '../supliers/suplier.service';
import { AddProductDto, UpdateProductDto } from './product.dto';
import { Product } from './product.entity';
import { CategoryService } from '../categories/category.service';
import { RedisCacheService } from '../caches/cache.service';
import { UploadService } from '../uploads/upload.service';
import { getPublicId } from '../../utils/string.util';
import { Status } from '../../commons/enum.common';
import { PhotoService } from '../photos/photo.service';
import {
  getAllForceOptions,
  getAllJoinOptions,
  IPaginate,
  IPagination,
} from '../../utils/interface.util';
import { MAX_ELEMENTS_OF_PAGE } from '../../commons/const.common';
import { getTotalPages } from '../../utils/number.util';
import { SaleProduct } from '../sale-products/sale-product.entity';
import { PaginationService } from '../paginations/pagination.service';

@Injectable()
export class ProductService extends ServiceUtil<Product, Repository<Product>> {
  constructor(
    private dataSource: DataSource,
    private photoService: PhotoService,
    private categoryService: CategoryService,
    private uploadService: UploadService,
    private suplierService: SuplierService,
    private paginationService: PaginationService<Product>,
  ) {
    super(dataSource.getRepository(Product));
  }

  async addProduct(
    avatar: Express.Multer.File[],
    photos: Express.Multer.File[],
    productInfo: AddProductDto,
  ): Promise<void> {
    if (
      await this.checkProductExist(
        productInfo.name,
        productInfo.barcode,
        productInfo.suplier,
        productInfo.category,
      )
    ) {
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
      os,
      screen,
      battery,
      barcode,
      importPrice,
      exportPrice,
      description,
      weight,
    } = productInfo;
    // check suplier is exist ?
    const existSuplier = await this.suplierService.checkSuplier(suplier);
    // check category is exist ?
    const existCategory = await this.categoryService.checkCategory(category);
    // check price
    if (Number(exportPrice) <= Number(importPrice)) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        'Import price can not greater than export price',
      );
    }
    // check weight
    if (weight) {
      if (Number(weight) <= 0) {
        throw new AppHttpException(
          HttpStatus.BAD_REQUEST,
          'Weight can not be lower or equal 0',
        );
      }
    }
    let avatarUrl = null;
    if (avatar) {
      const avatarUploaded = await this.uploadService.uploadToCloudinary(
        avatar[0],
        `products/${existCategory.name}`,
      );
      avatarUrl = avatarUploaded.url;
    }
    // save product to get product id
    const product = new Product(
      existCategory,
      existSuplier,
      name,
      barcode,
      avatarUrl,
      os,
      screen,
      battery,
      Number(importPrice),
      Number(exportPrice),
      Number(weight),
      description,
    );
    await this.repository.save(product);
    // upload photos and save photo into db
    if (photos) {
      const savePhotos = photos.reduce((savePhotos, photo, index) => {
        savePhotos.push(this.photoService.insertProductPhoto(photo, product));
        return savePhotos;
      }, []);
      await Promise.all(savePhotos);
    }
  }

  async updateProduct(
    updateInfo: UpdateProductDto,
    avatar: Express.Multer.File[],
  ): Promise<void> {
    const {
      id,
      category,
      suplier,
      name,
      os,
      screen,
      battery,
      barcode,
      importPrice,
      exportPrice,
      weight,
      description,
    } = updateInfo;
    /**
     * check product is exist ?
     * check new category is exist ?
     * check new suplier is exist ?
     * check importPrice lower than exportPrice
     * check weight greater than 0
     * check description length
     * check update barcode
     * check update avatar
     */
    const existProduct = await this.findOneAndJoin(
      { fkCategory: true, fkSuplier: true },
      { pkProduct: id },
    );
    if (!existProduct) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        'Product with this id is not exist',
      );
    }
    const existSuplier = await this.suplierService.checkSuplier(suplier);
    // check category is exist ?
    const existCategory = await this.categoryService.checkCategory(category);
    if (importPrice && exportPrice && importPrice >= exportPrice) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        'import price can not greater than export price',
      );
    } else if (
      importPrice &&
      !exportPrice &&
      Number(importPrice) >= existProduct.exportPrice
    ) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        `import price is not valid`,
      );
    } else if (
      exportPrice &&
      !importPrice &&
      Number(exportPrice) < existProduct.importPrice
    ) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        `export price is not valid`,
      );
    }
    if (Number(weight) <= 0) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        `Weight must be greater than 0`,
      );
    }
    /**
     * check upload
     */
    let uploadedAvatar;
    if (avatar) {
      await this.uploadService.removeFromCloudinary(
        getPublicId(existProduct.avatar),
        `products/${existProduct.fkCategory.name}`,
      );
      uploadedAvatar = await this.uploadService.uploadToCloudinary(
        avatar[0],
        `products/${existProduct.fkCategory.name}`,
      );
    }
    /**
     * update all information
     */
    existProduct.updateInformation(
      name,
      barcode,
      uploadedAvatar?.url,
      os,
      screen,
      battery,
      importPrice ? Number(importPrice) : undefined,
      exportPrice ? Number(exportPrice) : undefined,
      weight ? Number(weight) : undefined,
      description,
      existSuplier,
      existCategory,
    );
    await existProduct.save();
  }

  async getAllProducts(
    page: number,
    pLimit: string,
    search: string,
    sort: string,
    filter: string,
    range: string,
  ): Promise<IPagination<Product>> {
    if (page <= 0) page = 1;
    let limit = 25;
    if (Number(pLimit) !== NaN && Number(pLimit) >= 0) limit = Number(pLimit);
    const containSecretField = this.checkIncludeSecretField(
      search,
      sort,
      filter,
      range,
    );
    if (containSecretField) {
      return this.paginationService.getResponseObject([], 0, page, limit);
    }
    const join: getAllJoinOptions = {
      rootName: 'product',
      joinColumns: [
        {
          column: 'product.sales',
          optional: 'sales',
        },
        {
          column: 'sales.fkSale',
          optional: 'fkSale',
        },
      ],
    };
    let totals = [];
    try {
      totals = await this.getAlls(search, sort, filter, null, join, range);
    } catch {}
    totals = totals.map((item) => {
      item.sales = item.sales.filter((elm) => {
        return new Date(elm.fkSale.end) > new Date();
      });
      delete item.importPrice;
      return item;
    });
    const total = totals.length;
    const elements = totals.splice((page - 1) * limit, page * limit);
    this.paginationService.setPrefix('products/all');
    return this.paginationService.getResponseObject(
      elements,
      total,
      page,
      limit,
      search,
      sort,
      filter,
      range,
    );
  }

  async getAllActiveProducts(
    page: number,
    pLimit: string,
    search: string,
    sort: string,
    filter: string,
    range: string,
  ): Promise<IPagination<Product>> {
    if (page <= 0) page = 1;
    let limit = 25;
    if (Number(pLimit) !== NaN && Number(pLimit) >= 0) limit = Number(pLimit);
    const containSecretField = this.checkIncludeSecretField(
      search,
      sort,
      filter,
      range,
    );
    if (containSecretField) {
      return this.paginationService.getResponseObject([], 0, page, limit);
    }
    const forceTargets: getAllForceOptions = {
      forces: [
        {
          column: 'status',
          condition: 'active',
        },
      ],
    };
    const join: getAllJoinOptions = {
      rootName: 'product',
      joinColumns: [
        {
          column: 'product.sales',
          optional: 'sales',
        },
        {
          column: 'sales.fkSale',
          optional: 'fkSale',
        },
      ],
    };
    let totals = [];
    try {
      totals = await this.getAlls(
        search,
        sort,
        filter,
        forceTargets,
        join,
        range,
      );
    } catch {}
    totals = totals.map((item) => {
      item.sales = item.sales.filter((elm) => {
        return new Date(elm.fkSale.end) > new Date();
      });
      return item;
    });
    const total = totals.length;
    const elements = totals.splice((page - 1) * limit, page * limit);
    this.paginationService.setPrefix('products');
    return this.paginationService.getResponseObject(
      elements,
      total,
      page,
      limit,
      search,
      sort,
      filter,
      range,
    );
  }

  async changeProductStatus(id: string): Promise<void> {
    const existProduct = await this.getExistProduct(id);
    if (existProduct.status === Status.ACTIVE) {
      existProduct.status = Status.INACTIVE;
    } else {
      existProduct.status = Status.ACTIVE;
    }
    await existProduct.save();
  }

  async getExistProduct(id: string): Promise<Product> {
    const existProduct = await this.findOneByCondition({ pkProduct: id });
    if (!existProduct) {
      throw new AppHttpException(HttpStatus.BAD_REQUEST, 'Product not found');
    }
    return existProduct;
  }

  async checkProductExist(
    name: string,
    barcode: string,
    suplier: string,
    category: string,
  ): Promise<boolean> {
    const existProduct = await this.repository
      .createQueryBuilder()
      .where(
        'LOWER(name) = LOWER(:name) AND "fkSuplier" = :suplier AND "fkCategory" = :category OR "barcode" = :barcode',
        {
          name,
          suplier,
          category,
          barcode,
        },
      )
      .getOne();
    if (existProduct) return true;
    return false;
  }

  async getDetailProduct(id: string): Promise<Product> {
    const existProduct = await this.getExistProduct(id);
    if (existProduct.status === Status.INACTIVE) {
      throw new AppHttpException(HttpStatus.BAD_REQUEST, 'Product was removed');
    }
    const product = await this.repository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.fkCategory', 'category')
      .leftJoinAndSelect('product.fkSuplier', 'suplier')
      .leftJoinAndSelect('product.photos', 'photos')
      .leftJoinAndSelect('product.models', 'models')
      .leftJoinAndSelect('product.sales', 'sales')
      .leftJoinAndSelect('sales.fkSale', 'flashSales')
      .where('product.pkProduct =  :product', { product: id })
      .getOne();
    product.sales = product.sales.filter((item) => {
      return new Date(item.fkSale.end) > new Date();
    });
    return product;
  }

  async getFlashSaleProduct(id: string): Promise<SaleProduct> {
    const product = await this.repository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.sales', 'sales')
      .leftJoinAndSelect('sales.fkSale', 'flashSales')
      .where('product.pkProduct =  :product', { product: id })
      .getOne();
    product.sales = product.sales.filter((item) => {
      return (
        new Date(item.fkSale.end) > new Date() &&
        new Date(item.fkSale.begin) < new Date()
      );
    });
    if (product.sales.length <= 0) {
      return null;
    }
    return product.sales[0];
  }

  checkIncludeSecretField(search, sort, filter, range) {
    return (
      search?.includes('importPrice') ||
      sort?.includes('importPrice') ||
      filter?.includes('importPrice') ||
      range?.includes('importPrice')
    );
  }

  async checkProductInCategory(categoryId: string): Promise<boolean> {
    const existProduct = await this.findOneByCondition({
      fkCategory: { pkCategory: categoryId },
      status: Status.ACTIVE,
    });
    return !!existProduct;
  }
}
