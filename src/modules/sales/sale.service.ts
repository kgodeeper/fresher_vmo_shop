import { HttpStatus, Injectable } from '@nestjs/common';
import { AppHttpException } from '../../exceptions/http.exception';
import { ServiceUtil } from '../../utils/service.utils';
import {
  Between,
  DataSource,
  DataTypeNotSupportedError,
  MoreThan,
  Repository,
} from 'typeorm';
import { Sale } from './sale.entity';
import { AddSaleDto } from './sale.dto';
import { IPaginate } from '../../utils/interface.util';
import { MAX_ELEMENTS_OF_PAGE } from '../../commons/const.common';
import { getTotalPages } from '../../utils/number.util';

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

  async addSale(saleInfo: AddSaleDto): Promise<void> {
    const { begin, duration } = saleInfo;
    const beginDate = new Date(begin);
    const endDate = new Date(begin);
    endDate.setHours(endDate.getHours() + Number(duration));
    beginDate.setHours(beginDate.getHours() - 7);
    endDate.setHours(endDate.getHours() - 7);
    const existSale = await this.repository.findOne({
      where: [
        { begin: Between(beginDate, endDate) },
        { end: Between(beginDate, endDate) },
      ],
    });
    if (existSale) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        'Sale on this time already exist',
      );
    }
    const sale = new Sale(beginDate, endDate);
    await this.repository.save(sale);
  }

  async getAllSales(page: number): Promise<IPaginate<Sale>> {
    if (page <= 0) {
      throw new AppHttpException(HttpStatus.BAD_REQUEST, 'Page is not valid');
    }
    const allSales = await this.findAllByCondition({});
    if ((page - 1) * MAX_ELEMENTS_OF_PAGE >= allSales.length) {
      throw new AppHttpException(HttpStatus.BAD_REQUEST, 'Out of range');
    }
    const elements = allSales.slice(
      (page - 1) * MAX_ELEMENTS_OF_PAGE,
      page * MAX_ELEMENTS_OF_PAGE,
    );
    return {
      page,
      totalPages: getTotalPages(allSales.length),
      totalElements: allSales.length,
      elements,
    };
  }

  async getActiveSales(page: number): Promise<IPaginate<Sale>> {
    if (page <= 0) {
      throw new AppHttpException(HttpStatus.BAD_REQUEST, 'Page is not valid');
    }
    const allSales = await this.findAllByCondition({
      end: MoreThan(new Date()),
    });
    if ((page - 1) * MAX_ELEMENTS_OF_PAGE >= allSales.length) {
      throw new AppHttpException(HttpStatus.BAD_REQUEST, 'Out of range');
    }
    const elements = allSales.slice(
      (page - 1) * MAX_ELEMENTS_OF_PAGE,
      page * MAX_ELEMENTS_OF_PAGE,
    );
    return {
      page,
      totalPages: getTotalPages(allSales.length),
      totalElements: allSales.length,
      elements,
    };
  }

  async getSaleDetail(id: string): Promise<Sale> {
    const existSale = await this.repository
      .createQueryBuilder('sale')
      .leftJoinAndSelect('sale.products', 'product_sale')
      .leftJoinAndSelect('product_sale.fkProduct', 'product')
      .getOne();
    if (!existSale) {
      throw new AppHttpException(HttpStatus.BAD_REQUEST, 'Sale is not exist');
    }
    return existSale;
  }
}
