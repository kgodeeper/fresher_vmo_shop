import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { customerGender } from 'src/commons/enum.common';
import { ServiceUtil } from 'src/utils/service.util';
import { formatName } from 'src/utils/string.util';
import { DataSource, Repository } from 'typeorm';
import { AccountService } from '../accounts/account.service';
import { UploadService } from '../uploads/upload.service';
import { Customer } from './customer.entity';
import { CustomerValidator } from './customer.validator';

@Injectable()
export class CustomerService extends ServiceUtil<
  Customer,
  Repository<Customer>
> {
  constructor(
    private dataSource: DataSource,
    private accountService: AccountService,
    private uploadService: UploadService,
  ) {
    super(dataSource.getRepository(Customer));
  }

  async updateCustomerInfo(
    username: string,
    customerInfo: CustomerValidator,
    file?: Express.Multer.File,
  ) {
    if (customerInfo.fullname) {
      customerInfo.fullname = formatName(customerInfo.fullname);
    }
    if (file) {
      const uploaded = await this.uploadService.uploadToCloudinary(file);
      customerInfo.avatar = uploaded.url;
    }
    const account = await this.accountService.getAccountByUsername(username);
    const customer = new Customer(
      customerInfo.fullname,
      customerInfo.dob,
      customerInfo.gender as customerGender,
      customerInfo.avatar,
      account,
    );
    await this.repository.upsert(customer, ['fkAccount']);
  }
}
