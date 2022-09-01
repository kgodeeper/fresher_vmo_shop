import { HttpStatus, Injectable } from '@nestjs/common';
import { ServiceUtil } from '../../utils/service.utils';
import { DataSource, Repository } from 'typeorm';
import { Suplier } from './suplier.entity';
import { AppHttpException } from '../../exceptions/http.exception';
import { Status } from '../../commons/enum.common';

@Injectable()
export class SuplierService extends ServiceUtil<Suplier, Repository<Suplier>> {
  constructor(private dataSource: DataSource) {
    super(dataSource.getRepository(Suplier));
  }

  async getById(id: string): Promise<Suplier> {
    return this.repository.findOne({ where: { pkSuplier: id } });
  }

  async checkSuplier(id: string): Promise<Suplier> {
    const existSuplier = await this.getById(id);
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
    return existSuplier;
  }
}
