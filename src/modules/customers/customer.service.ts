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
    const existAccount = await this.accountService.findOneByCondition({
      username,
    });
    if (existAccount.status !== AccountStatus.ACTIVE) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        `Account was ${existAccount.status}`,
      );
    }
    let existCustomer = await this.findOneAndJoin(
      { fkAccount: true },
      {
        fkAccount: { pkAccount: existAccount.pkAccount },
      },
    );
    const { dob, gender } = information;
    const fullname = formatName(information.fullname);
    if (!existCustomer) {
      existCustomer = new Customer(fullname, dob, gender, existAccount);
    } else {
      existCustomer.updateInformation(fullname, dob, gender);
    }
    /**
     * update if customer is exist, insert else
     */
    await this.repository.upsert(existCustomer, ['fkAccount']);
  }

  async getInformation(username: string): Promise<Customer> {
    const existAccount = await this.accountService.findOneByCondition({
      username,
    });
    if (existAccount.status !== AccountStatus.ACTIVE) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        `Account was ${existAccount.status}`,
      );
    }
    let customer = await this.findOneAndJoin(
      { fkAccount: true },
      { fkAccount: { pkAccount: existAccount.pkAccount } },
    );
    if (!customer) {
      /**
       * if customer information is not updated, only return customer's account
       */
      customer = new Customer(null, null, null, existAccount);
    }
    /**
     * delete some secret information
     */
    delete customer.pkCustomer;
    delete customer.fkAccount.password;
    delete customer.fkAccount.pkAccount;
    return customer;
  }

  async getCustomerByUsername(username: string): Promise<Customer> {
    const existAccount = await this.accountService.checkAccountByUsername(
      true,
      true,
      username,
    );
    const existCustomer = await this.findOneAndJoin(
      { fkAccount: true },
      { fkAccount: { pkAccount: existAccount.pkAccount } },
    );
    if (!existCustomer) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        'Customer is not exist',
      );
    }
    return existCustomer;
  }
}
