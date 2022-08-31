import { Injectable } from '@nestjs/common';
import { ServiceUtil } from 'src/utils/service.utils';
import { DataSource, Repository } from 'typeorm';
import { Suplier } from './suplier.entity';

@Injectable()
export class SuplierService extends ServiceUtil<Suplier, Repository<Suplier>> {
  constructor(private dataSource: DataSource) {
    super(dataSource.getRepository(Suplier));
  }
}
