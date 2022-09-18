import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { totalmem } from 'os';
import { QueryResult } from 'typeorm';
import { MAX_ELEMENTS_OF_PAGE } from '../../commons/const.common';
import { IPagination } from '../../utils/interface.util';
import { getTotalPages } from '../../utils/number.util';

@Injectable()
export class PaginationService<T> {
  baseURL: string;
  prefix: string;
  constructor(private configService: ConfigService) {}
  setPrefix(prefix: string) {
    this.prefix = prefix;
    this.baseURL = this.configService.get<string>('BASEURL');
  }
  async getResponseObject(
    items: T[],
    totalItems: number,
    page: number,
    limit: number,
    search?: string,
    sort?: string,
    filter?: string,
    range?: string,
  ): Promise<IPagination<T>> {
    let firstPage, lastPage, nextPage, previousPage;
    let queryString = `&limit=${limit}`;
    if (search) queryString += `&search=${search}`;
    if (sort) queryString += `&sort=${sort}`;
    if (filter) queryString += `&filter=${filter}`;
    if (range) queryString += `&range=${range}`;
    if (totalItems == 0) {
      firstPage = lastPage = nextPage = previousPage = null;
    } else {
      const maxPage = getTotalPages(totalItems, limit);
      firstPage = `${this.baseURL}/${this.prefix}?page=1${queryString}`;
      nextPage =
        page + 1 <= maxPage
          ? `${this.baseURL}/${this.prefix}?page=${page + 1}${queryString}`
          : null;
      lastPage = `${this.baseURL}/${this.prefix}?page=${maxPage}${queryString}`;
      previousPage =
        page - 1 > 0
          ? `${this.baseURL}/${this.prefix}?page=${page - 1}${queryString}`
          : null;
    }
    return {
      items,
      metadata: {
        totalItems,
        itemCount: items.length,
        itemPerPage: limit,
        totalPages: getTotalPages(totalItems, limit),
        currentPage: page,
      },
      links: {
        firstPage,
        lastPage,
        nextPage,
        previousPage,
      },
    };
  }
}
