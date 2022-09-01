import { HttpStatus, Injectable } from '@nestjs/common';
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
import { IPaginate } from '../../utils/interface.util';
import { MAX_ELEMENTS_OF_PAGE } from '../../commons/const.common';
import { getTotalPages } from '../../utils/number.util';
import { last } from 'rxjs';

@Injectable()
export class ProductService extends ServiceUtil<Product, Repository<Product>> {
  constructor(
    private dataSource: DataSource,
    private photoService: PhotoService,
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
    photos: Express.Multer.File[],
    productInfo: AddProductDto,
  ): Promise<void> {
    if (
      await this.checkProductExist(
        productInfo.name,
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
    if (Number(weight) <= 0) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        'Weight can not be lower or equal 0',
      );
    }
    // upload
    const barcodeUploaded = await this.uploadService.uploadToCloudinary(
      barcode[0],
      'products/barcode',
    );
    const avatarUploaded = await this.uploadService.uploadToCloudinary(
      avatar[0],
      `products/${existCategory.name}`,
    );
    // save product to get product id
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
    // upload photos and save photo into db
    if (photos) {
      const savePhotos = photos.reduce((savePhotos, photo, index) => {
        savePhotos.push(this.photoService.insertProductPhoto(photo, product));
        return savePhotos;
      }, []);
      await Promise.all(savePhotos);
    }
    /**
     * cache quantiy
     */
    await this.cacheService.updateQuantityValue('shop:all:products', 1);
    await this.cacheService.updateQuantityValue('shop:active:products', 1);
  }

  async updateProduct(
    updateInfo: UpdateProductDto,
    barcode: Express.Multer.File[],
    avatar: Express.Multer.File[],
  ): Promise<void> {
    const {
      id,
      category,
      suplier,
      name,
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
    if (description.length > 10000) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        `Description too long`,
      );
    }
    /**
     * check upload
     */
    let uploadedBarcode, uploadedAvatar;
    if (barcode) {
      await this.uploadService.removeFromCloudinary(
        getPublicId(existProduct.barcode),
        `products/barcode`,
      );
      uploadedBarcode = await this.uploadService.uploadToCloudinary(
        barcode[0],
        `products/barcode`,
      );
    }
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
      uploadedBarcode?.url,
      uploadedAvatar?.url,
      importPrice,
      exportPrice,
      weight,
      description,
      existSuplier,
      existCategory,
    );
    await existProduct.save();
  }

  async getAllProducts(page: number): Promise<IPaginate<Product>> {
    if (page <= 0) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        'Page number not found',
      );
    }
    const totalElements = Number(
      await this.cacheService.get('shop:all:products'),
    );
    const elements = await this.getProducts(page);
    if (elements.length === 0) {
      throw new AppHttpException(HttpStatus.BAD_REQUEST, `Out of range`);
    }
    return {
      page,
      totalPages: getTotalPages(totalElements),
      totalElements,
      elements,
    };
  }

  async getAllActiveProducts(page: number): Promise<IPaginate<Product>> {
    if (page <= 0) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        'Page number not found',
      );
    }
    const totalElements = Number(
      await this.cacheService.get('shop:active:products'),
    );
    const elements = await this.getActiveProducts(page);
    if (elements.length === 0) {
      throw new AppHttpException(HttpStatus.BAD_REQUEST, `Out of range`);
    }
    return {
      page,
      totalPages: getTotalPages(totalElements),
      totalElements,
      elements,
    };
  }

  async searchProduct(key: string, page: number): Promise<IPaginate<Product>> {
    if (page <= 0) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        `Page number is not valid`,
      );
    }
    const searchElements = await this.searchActiveProduct(key);
    const totalElements = searchElements.length;
    if ((page - 1) * MAX_ELEMENTS_OF_PAGE >= totalElements) {
      throw new AppHttpException(HttpStatus.BAD_REQUEST, `Out of range`);
    }
    const lastIndex = page * MAX_ELEMENTS_OF_PAGE + 1;
    const elements = searchElements.slice(
      (page - 1) * MAX_ELEMENTS_OF_PAGE,
      lastIndex,
    );
    return {
      page,
      totalPages: getTotalPages(totalElements),
      totalElements,
      elements,
    };
  }

  async filterProduct(
    category: string,
    suplier: string,
    page: number,
  ): Promise<IPaginate<Product>> {
    if (page <= 0) {
    }
    const filterElements = await this.findAllWithJoin(
      { fkCategory: true, fkSuplier: true, photos: true },
      {
        fkCategory: { pkCategory: category },
        fkSuplier: { pkSuplier: suplier },
        status: Status.ACTIVE,
      },
    );
    const totalElements = filterElements.length;
    if ((page - 1) * MAX_ELEMENTS_OF_PAGE >= totalElements) {
      throw new AppHttpException(HttpStatus.BAD_REQUEST, `Out of range`);
    }
    const lastIndex = page * MAX_ELEMENTS_OF_PAGE + 1;
    const elements = filterElements.slice(
      (page - 1) * MAX_ELEMENTS_OF_PAGE,
      lastIndex,
    );
    return {
      page,
      totalPages: getTotalPages(totalElements),
      totalElements,
      elements,
    };
  }

  async removeProduct(id: string): Promise<void> {
    const existProduct = await this.getExistProduct(id);
    existProduct.status = Status.INACTIVE;
    await existProduct.save();
    /**
     * recache active product quantity
     */
    await this.cacheService.updateQuantityValue('shop:active:products', -1);
  }

  async getExistProduct(id: string): Promise<Product> {
    const existProduct = await this.findOneByCondition({ pkProduct: id });
    if (!existProduct) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        'Product with this id is not exist',
      );
    }
    if (existProduct.status !== Status.ACTIVE) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        `Product with this id was ${existProduct.status}`,
      );
    }
    return existProduct;
  }

  async checkProductExist(
    name: string,
    suplier: string,
    category: string,
  ): Promise<boolean> {
    const existProduct = await this.repository
      .createQueryBuilder()
      .where(
        'LOWER(name) = LOWER(:name) AND "fkSuplier" = :suplier AND "fkCategory" = :category',
        {
          name,
          suplier,
          category,
        },
      )
      .getOne();
    if (existProduct) return true;
    return false;
  }

  async getProducts(page: number): Promise<Product[]> {
    return await this.repository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.fkCategory', 'categoty')
      .leftJoinAndSelect('product.fkSuplier', 'suplier')
      .leftJoinAndSelect('product.photos', 'photos')
      .offset((page - 1) * MAX_ELEMENTS_OF_PAGE)
      .limit(MAX_ELEMENTS_OF_PAGE)
      .getMany();
  }

  async getActiveProducts(page: number): Promise<Product[]> {
    return await this.repository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.fkCategory', 'categoty')
      .leftJoinAndSelect('product.fkSuplier', 'suplier')
      .leftJoinAndSelect('product.photos', 'photos')
      .where('"product"."status" = :status', { status: Status.ACTIVE })
      .offset((page - 1) * MAX_ELEMENTS_OF_PAGE)
      .limit(MAX_ELEMENTS_OF_PAGE)
      .getMany();
  }

  async searchActiveProduct(key: string): Promise<Product[]> {
    key = `%${key}%`;
    return await this.repository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.fkCategory', 'categoty')
      .leftJoinAndSelect('product.fkSuplier', 'suplier')
      .leftJoinAndSelect('product.photos', 'photos')
      .where(
        'LOWER("product"."name") LIKE LOWER(:key) AND "product"."status" = :status',
        {
          key,
          status: Status.ACTIVE,
        },
      )
      .getMany();
  }
}
