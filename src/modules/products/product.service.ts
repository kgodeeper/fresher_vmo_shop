import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Multer } from 'multer';
import { commonStatus } from 'src/commons/enum.common';
import { ServiceUtil } from 'src/utils/service.util';
import { getPublicId } from 'src/utils/string.util';
import { DataSource, Repository } from 'typeorm';
import { CategoryService } from '../categories/category.service';
import { PictureService } from '../pictures/picture.service';
import { SuplierService } from '../supliers/suplier.service';
import { UploadService } from '../uploads/upload.service';
import { Product } from './product.entity';
import { UpdateProductValidator } from './product.validator';

@Injectable()
export class ProductService extends ServiceUtil<Product, Repository<Product>> {
  constructor(
    private dataSource: DataSource,
    private categoryService: CategoryService,
    private suplierService: SuplierService,
    private uploadService: UploadService,
  ) {
    super(dataSource.getRepository(Product));
  }

  async createProduct(
    productInfo,
    barcode: Express.Multer.File[],
    avatar: Express.Multer.File[],
  ) {
    const { avatarUrl, barcodeUrl } = await this.uploadProductImage(
      avatar,
      barcode,
      true,
    );
    const {
      name,
      suplierId,
      categoryId,
      importPrice,
      exportPrice,
      weight,
      description,
    } = productInfo;
    const category = await this.categoryService.findOneByCondition({
      where: { pkCategory: categoryId },
    });
    if (!category) {
      this.removePicture([barcodeUrl, avatarUrl]);
      throw new HttpException('Invalid category', HttpStatus.BAD_REQUEST);
    }
    const suplier = await this.suplierService.findOneByCondition({
      where: { pkSuplier: suplierId },
    });
    if (!suplier) {
      this.removePicture([barcodeUrl, avatarUrl]);
      throw new HttpException('Invalid suplier', HttpStatus.BAD_REQUEST);
    }
    const curProduct = await this.repository
      .createQueryBuilder('product')
      .where(
        `LOWER(name) = LOWER(:name) AND "fkCategory" = :categoryId AND "fkSuplier" = :suplierId`,
        { name, categoryId: category.pkCategory, suplierId: suplier.pkSuplier },
      )
      .getOne();
    if (curProduct) {
      this.removePicture([barcodeUrl, avatarUrl]);
      throw new HttpException('Product already exist', HttpStatus.BAD_REQUEST);
    }
    const product = new Product(
      name,
      barcodeUrl,
      importPrice,
      exportPrice,
      weight,
      description,
      category,
      suplier,
    );
    await product.save();
  }

  async changeStatus(status: commonStatus, productId) {
    const product = await this.findOneByCondition({
      where: { pkProduct: productId },
    });
    if (product.status === status) {
      throw new HttpException(
        `Already in ${status} status`,
        HttpStatus.BAD_REQUEST,
      );
    }
    product.status = status;
    await product.save();
  }

  async removePicture(urls: string[]) {
    for (let i = 0; i < urls.length; i++) {
      const publicId = getPublicId(urls[i]);
      await this.uploadService.removeFromCloudinary(publicId);
    }
  }

  async uploadProductImage(
    avatar: Express.Multer.File[],
    barcode: Express.Multer.File[],
    required: boolean,
  ) {
    let avatarUrl = '',
      barcodeUrl = '';
    if (avatar) {
      const avatarUploaded = await this.uploadService.uploadToCloudinary(
        avatar[0],
      );
      avatarUrl = avatarUploaded.url;
    }
    if (!barcode) {
      if (required) this.removePicture([avatarUrl]);
      throw new HttpException('Barcode is required', HttpStatus.BAD_REQUEST);
    }
    const upload = await this.uploadService.uploadToCloudinary(barcode[0]);
    barcodeUrl = upload.url;
    return { avatarUrl, barcodeUrl };
  }
}
