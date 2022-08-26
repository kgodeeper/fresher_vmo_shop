import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ServiceUtil } from 'src/utils/service.util';
import { DataSource, Repository } from 'typeorm';
import { Product } from '../products/product.entity';
import { Picture } from './picture.entity';

@Injectable()
export class PictureService extends ServiceUtil<Picture, Repository<Picture>> {
  constructor(private dataSource: DataSource) {
    super(dataSource.getRepository(Picture));
  }
  async createPicture(url: string, product: Product) {
    if (!url) {
      throw new HttpException('Invalid url', HttpStatus.BAD_REQUEST);
    }
    const picture = new Picture(url, product);
    await picture.save();
  }
}
