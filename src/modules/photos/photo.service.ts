import { Injectable } from '@nestjs/common';
import { ServiceUtil } from '../../utils/service.utils';
import { DataSource, Repository } from 'typeorm';
import { Photo } from './photo.entity';
import { Product } from '../products/product.entity';
import { UploadService } from '../uploads/upload.service';

@Injectable()
export class PhotoService extends ServiceUtil<Photo, Repository<Photo>> {
  constructor(
    private dataSource: DataSource,
    private uploadService: UploadService,
  ) {
    super(dataSource.getRepository(Photo));
  }
  async insertProductPhoto(
    photo: Express.Multer.File,
    product: Product,
  ): Promise<Photo> {
    const uploaded = await this.uploadService.uploadToCloudinary(
      photo,
      'photos',
    );
    const photoEntity = new Photo();
    photoEntity.path = uploaded.url;
    photoEntity.fkProduct = product;
    await this.repository.insert(photoEntity);
    return photoEntity;
  }
}
