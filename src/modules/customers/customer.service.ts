import { Injectable } from '@nestjs/common';
import { ServiceUtil } from 'src/utils/service.util';
import { DataSource, Repository } from 'typeorm';
import { Customer } from './customer.entity';
import { CustomerValidator } from './customer.validator';

@Injectable()
export class CustomerService extends ServiceUtil<
  Customer,
  Repository<Customer>
> {
  constructor(private dataSource: DataSource) {
    super(dataSource.getRepository(Customer));
  }

  updateCustomerInfo(customerInfo: CustomerValidator): string {
    return '';
  }
}
