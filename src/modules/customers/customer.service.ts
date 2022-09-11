import { HttpStatus, Injectable } from '@nestjs/common';
import { AccountStatus } from '../../commons/enum.common';
import { AppHttpException } from '../../exceptions/http.exception';
import { ServiceUtil } from '../../utils/service.utils';
import { DataSource, Repository } from 'typeorm';
import { formatName } from '../../utils/string.util';
import { AccountService } from '../accounts/account.service';
import { UpdateCustomerInformationDto } from './customer.dto';
import { Customer } from './customer.entity';

@Injectable()
export class CustomerService extends ServiceUtil<
  Customer,
  Repository<Customer>
> {
  constructor(
    private accountService: AccountService,
    private dataSource: DataSource,
  ) {
    super(dataSource.getRepository(Customer));
  }
  async updateInformation(
    username: string,
    information: UpdateCustomerInformationDto,
  ): Promise<void> {
    const { dob, gender } = information;
    let fullname = information.fullname;
    if (fullname) {
      fullname = formatName(information.fullname);
    }
    if (!dob && !gender && !fullname) {
      throw new AppHttpException(HttpStatus.BAD_REQUEST, 'Nothing to update');
    }
    const existAccount = await this.accountService.getActiveAccountName(
      username,
    );
    let existCustomer = await this.getCustomerByAccount(existAccount.pkAccount);
    if (!existCustomer) {
      existCustomer = new Customer(fullname, dob, gender, existAccount);
    } else {
      existCustomer.updateInformation(fullname, dob, gender);
    }
    /**
     * update if customer is exist, insert else
     */
    await this.upsertCustomer(existCustomer);
  }

  async getInformation(username: string): Promise<Customer> {
    const existAccount = await this.accountService.getActiveAccountName(
      username,
    );
    let existCustomer = await this.getCustomerByAccount(existAccount.pkAccount);
    if (!existCustomer) {
      /**
       * if customer information is not updated, only return customer's account
       */
      existCustomer = new Customer(null, null, null, existAccount);
    }
    /**
     * delete some secret information
     */
    delete existCustomer.pkCustomer;
    delete existCustomer.fkAccount.password;
    delete existCustomer.fkAccount.pkAccount;
    return existCustomer;
  }

  async getCustomerByAccount(accountId: string): Promise<Customer> {
    const existCustomer = await this.findOneAndJoin(
      { fkAccount: true },
      { fkAccount: { pkAccount: accountId } },
    );
    return existCustomer;
  }

  async getCustomerByUsername(username: string): Promise<Customer> {
    const existAccount = await this.accountService.getActiveAccountName(
      username,
    );
    const existCustomer = await this.getCustomerByAccount(
      existAccount.pkAccount,
    );
    if (!existCustomer) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        'Customer is not exist',
      );
    }
    return existCustomer;
  }

  async upsertCustomer(customer: Customer): Promise<void> {
    this.repository.upsert(customer, ['fkAccount']);
  }

  async getSaleEmail(): Promise<{ name: string; email: string }[]> {
    const customerRegSales = await this.findAllWithJoin(
      { fkAccount: true },
      { receiveSale: true },
    );
    return customerRegSales.map((item): { name: string; email: string } => {
      return {
        name: item.fkAccount.username,
        email: item.fkAccount.email,
      };
    });
  }
}
