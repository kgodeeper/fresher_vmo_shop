import { HttpStatus, Injectable } from '@nestjs/common';
import { AppHttpException } from '../../exceptions/http.exception';
import { DataSource, Repository } from 'typeorm';
import { ServiceUtil } from '../../utils/service.utils';
import { AccountService } from '../accounts/account.service';
import { CustomerService } from '../customers/customer.service';
import { AddDeliveryDto, UpdateDeliveryDto } from './delivery.dto';
import { Delivery } from './delivery.entity';
import { Status } from '../../commons/enum.common';

@Injectable()
export class DeliveryService extends ServiceUtil<
  Delivery,
  Repository<Delivery>
> {
  constructor(
    private dataSource: DataSource,
    private accountService: AccountService,
    private customerService: CustomerService,
  ) {
    super(dataSource.getRepository(Delivery));
  }

  async addDeliveryAddress(
    username: string,
    deliveryInfo: AddDeliveryDto,
  ): Promise<void> {
    const existAccount = await this.accountService.getActiveAccountName(
      username,
    );

    const existCustomer = await this.customerService.getCustomerByAccount(
      existAccount.pkAccount,
    );

    /**
     * if not exist customer information, throw error
     */
    if (!existCustomer) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        'Customer information has not been updated, so you cannot add a delivery address',
      );
    }
    /**
     * limit address number of user: 3
     */
    const countDelivery = await this.countCustomerDelivery(
      existCustomer.pkCustomer,
    );
    if (countDelivery >= 3) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        'You are maximum of delivery address',
      );
    }
    /**
     * if exist customer information,check delivery address, then add delivery address
     */
    const { phone, receiver, homeAddress, district, province } = deliveryInfo;
    const countExist = await this.countAllByCondition({
      phone,
      receiver,
      homeAddress,
      district,
      province,
      status: Status.ACTIVE,
    });
    if (countExist > 0) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        'Delivery address is already exist',
      );
    }
    const delivery = new Delivery(
      phone,
      receiver,
      homeAddress,
      district,
      province,
      existCustomer,
    );
    await this.saveDelivery(delivery);
  }

  async updateDelivery(
    updateInfo: UpdateDeliveryDto,
    username: string,
  ): Promise<void> {
    const existAccount = await this.accountService.checkAccountByUsername(
      true,
      true,
      username,
    );
    /**
     * check delivery is belong to user ?
     */
    const existCustomer = await this.customerService.findOneAndJoin(
      { fkAccount: true },
      { fkAccount: { pkAccount: existAccount.pkAccount } },
    );
    if (!existCustomer) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        'You are not owner of this delivery address',
      );
    }
    const existDelivery = await this.findOneAndJoin(
      { fkCustomer: true },
      { pkAddress: updateInfo.deliveryID },
    );
    if (!existDelivery) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        `Delivery address with this id is not exist`,
      );
    }
    if (existDelivery.fkCustomer.pkCustomer !== existCustomer.pkCustomer) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        'You are not owner of this delivery address',
      );
    }
    const { phone, receiver, homeAddress, district, province } = updateInfo;
    existDelivery.updateInformation(
      phone,
      receiver,
      homeAddress,
      district,
      province,
    );
    await existDelivery.save();
  }

  async deleteDelivery(id: string, username: string): Promise<void> {
    const existAccount = await this.accountService.getActiveAccountName(
      username,
    );
    const existCustomer = await this.customerService.findOneAndJoin(
      { fkAccount: true },
      { fkAccount: { pkAccount: existAccount.pkAccount } },
    );
    if (!existCustomer) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        `You are not own this delivery address`,
      );
    }
    const existDelivery = await this.findOneAndJoin(
      { fkCustomer: true },
      { fkCustomer: { pkCustomer: existCustomer.pkCustomer }, pkAddress: id },
    );
    if (!existDelivery) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        `You are not own this delivery address`,
      );
    }
    await this.repository.softDelete(existDelivery.pkAddress);
  }

  async getOwnDelivery(username: string): Promise<Delivery[]> {
    const existAccount = await this.accountService.checkAccountByUsername(
      true,
      true,
      username,
    );
    const existCustomer = await this.customerService.findOneAndJoin(
      { fkAccount: true },
      { fkAccount: { pkAccount: existAccount.pkAccount } },
    );
    if (!existCustomer) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        `You have no delivery address`,
      );
    }
    const deliveries = await this.findAllWithJoin(
      { fkCustomer: true },
      {
        fkCustomer: { pkCustomer: existCustomer.pkCustomer },
        status: Status.ACTIVE,
      },
    );
    if (deliveries.length === 0) {
      if (!existCustomer) {
        throw new AppHttpException(
          HttpStatus.BAD_REQUEST,
          `You have no delivery address`,
        );
      }
    }
    return deliveries;
  }

  async getDelivery(id: string): Promise<Delivery> {
    const existDelivery = await this.findOneAndJoin(
      { fkCustomer: true },
      { pkAddress: id },
    );
    if (!existDelivery) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        `Delivery address with this id is not exist`,
      );
    }
    return existDelivery;
  }

  async getCustomerDelivery(id: string, customer: string): Promise<Delivery> {
    const existDelivery = await this.findOneAndJoin(
      {
        fkCustomer: true,
      },
      {
        pkAddress: id,
        fkCustomer: { pkCustomer: customer },
      },
    );
    if (!existDelivery) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        `You dont have this delivery`,
      );
    }
    if (existDelivery.status !== Status.ACTIVE) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        'Your delivery address was remove',
      );
    }
    return existDelivery;
  }

  async countCustomerDelivery(customerId: string): Promise<number> {
    return this.countAllByCondition({
      fkCustomer: { pkCustomer: customerId },
      status: Status.ACTIVE,
    });
  }

  async saveDelivery(delivery: Delivery): Promise<void> {
    this.repository.save(delivery);
  }
}
