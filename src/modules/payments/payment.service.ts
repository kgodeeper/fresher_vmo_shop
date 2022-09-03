import { Injectable } from '@nestjs/common';
import { ServiceUtil } from 'src/utils/service.utils';
import { DataSource, Repository } from 'typeorm';
import { Payment } from './payment.entity';

@Injectable()
export class PaymentService extends ServiceUtil<Payment, Repository<Payment>> {
  constructor(private dataSource: DataSource) {
    super(dataSource.getRepository(Payment));
  }
}
