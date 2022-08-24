import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ServiceUtil } from 'src/utils/service.util';
import { DataSource, Repository } from 'typeorm';
import { AccountService } from '../accounts/account.service';
import { CustomerService } from '../customers/customer.service';
import { DeliveryAddress } from './delivery.entity';
import {
  DeliveryValidator,
  UpdateDeliveryValidator,
} from './delivery.validator';

@Injectable()
export class DeliveryService extends ServiceUtil<
  DeliveryAddress,
  Repository<DeliveryAddress>
> {
  constructor(
    private accountService: AccountService,
    private customerService: CustomerService,
    private dataSource: DataSource,
  ) {
    super(dataSource.getRepository(DeliveryAddress));
  }
  async addDelivery(username: string, delivery: DeliveryValidator) {
    const user = await this.accountService.getAccountByUsername(username);
    const customer = await this.customerService.findOneByCondition({
      relations: {
        fkAccount: true,
      },
      where: {
        fkAccount: {
          pkAccount: user.pkAccount,
        },
      },
    });
    const { phone, receiver, homeAddress, district, province } = delivery;
    const curAddress = await this.findOneByCondition({
      where: [{ homeAddress }, { district }, { province }],
    });
    if (curAddress)
      throw new HttpException('Address already exist', HttpStatus.BAD_REQUEST);
    const deliveryAddress = new DeliveryAddress(
      phone,
      receiver,
      homeAddress,
      district,
      province,
      customer,
    );
    await this.repository.insert(deliveryAddress);
  }

  async updateDeliveryAddress(delivery: UpdateDeliveryValidator) {
    const { phone, receiver, homeAddress, district, province } = delivery;
    await this.repository.update(
      { pkAddress: delivery.pkAddress },
      { phone, receiver, homeAddress, district, province },
    );
  }

  async getDeliveryAddress(username): Promise<DeliveryAddress[]> {
    const user = await this.accountService.getAccountByUsername(username);
    const customer = await this.customerService.findOneByCondition({
      relations: {
        fkAccount: true,
      },
      where: {
        fkAccount: {
          pkAccount: user.pkAccount,
        },
      },
    });
    return this.findAll({
      relations: {
        fkCustomer: true,
      },
      where: {
        fkCustomer: {
          pkCustomer: customer.pkCustomer,
        },
      },
    });
  }

  async deleteDelivery(deliveryId: string) {
    const delivery = await this.findOneByCondition({
      where: { pkAddress: deliveryId },
    });
    if (!delivery)
      throw new HttpException('Delivery is not exist', HttpStatus.BAD_REQUEST);
    await this.repository.delete({ pkAddress: deliveryId });
  }
}
