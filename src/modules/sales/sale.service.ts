import { HttpStatus, Injectable } from '@nestjs/common';
import { AppHttpException } from '../../exceptions/http.exception';
import { ServiceUtil } from '../../utils/service.utils';
import { DataSource, Repository } from 'typeorm';
import { Sale } from './sale.entity';

@Injectable()
export class SaleService extends ServiceUtil<Sale, Repository<Sale>> {
  constructor(private dataSource: DataSource) {
    super(dataSource.getRepository(Sale));
  }

  async getExistSale(id: string): Promise<Sale> {
    const existSale = await this.findOneByCondition({ pkSale: id });
    if (!existSale) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        'Sale with this id is not exist',
      );
    }
    return existSale;
  }
}
