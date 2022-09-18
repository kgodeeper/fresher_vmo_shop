import { HttpStatus, Injectable } from '@nestjs/common';
import { AppHttpException } from '../../exceptions/http.exception';
import { ServiceUtil } from '../../utils/service.utils';
import { Between, DataSource, MoreThan, Repository } from 'typeorm';
import { Sale } from './sale.entity';
import { AddSaleDto } from './sale.dto';
import {
  getAllForceOptions,
  IPaginate,
  IPagination,
} from '../../utils/interface.util';
import { MAX_ELEMENTS_OF_PAGE } from '../../commons/const.common';
import { getTotalPages } from '../../utils/number.util';
import { ConfigService } from '@nestjs/config';
import { PaginationService } from '../paginations/pagination.service';

@Injectable()
export class SaleService extends ServiceUtil<Sale, Repository<Sale>> {
  constructor(
    private dataSource: DataSource,
    private paginationService: PaginationService<Sale>,
    private configService: ConfigService,
  ) {
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

  async getAllSales(
    page: number,
    pLimit: string,
    search: string,
    sort: string,
    filter: string,
  ): Promise<IPagination<Sale>> {
    if (page <= 0) page = 1;
    let limit = 25;
    if (Number(pLimit) !== NaN && Number(pLimit) >= 0) limit = Number(pLimit);
    let totals = [];
    try {
      totals = await this.getAlls(search, sort, filter, null, null);
    } catch (error) {
      console.log(error);
    }
    const total = totals.length;
    const elements = totals.splice((page - 1) * limit, page * limit);
    this.paginationService.setPrefix('sales/all');
    return this.paginationService.getResponseObject(
      elements,
      total,
      page,
      limit,
      search,
      sort,
      filter,
    );
  }

  async getFutureSales(
    page: number,
    pLimit: string,
  ): Promise<IPagination<Sale>> {
    if (page <= 0) page = 1;
    let limit = 25;
    if (Number(pLimit) !== NaN && Number(pLimit) >= 0) limit = Number(pLimit);
    const totals = await this.repository
      .createQueryBuilder()
      .where('"begin" > now()')
      .getMany();
    const total = totals.length;
    const elements = totals.splice((page - 1) * limit, page * limit);
    this.paginationService.setPrefix('sales/feature');
    return this.paginationService.getResponseObject(
      elements,
      total,
      page,
      limit,
    );
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

  async getUpcomingSale(): Promise<Sale> {
    const delayTime = this.configService.get<number>('SEND_FLASHSALE_DELAY');
    return this.repository
      .createQueryBuilder()
      .where(
        `"begin" BETWEEN now() + interval '${
          delayTime - 1
        } minutes' AND now() + interval '${delayTime} minutes'`,
      )
      .getOne();
  }

  async getCurrentSale(): Promise<Sale> {
    return this.repository
      .createQueryBuilder()
      .where(`now() BETWEEN "begin" AND "end"`)
      .getOne();
  }
}
