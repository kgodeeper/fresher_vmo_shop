import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { totalmem } from 'os';
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
  ): Promise<IPagination<T>> {
    let firstPage, lastPage, nextPage, previousPage;
    if (totalItems == 0) {
      firstPage = lastPage = nextPage = previousPage = null;
    } else {
      const maxPage = getTotalPages(totalItems, limit);
      firstPage = `${this.baseURL}/${this.prefix}/1`;
      nextPage =
        page + 1 <= maxPage
          ? `${this.baseURL}/${this.prefix}/${page + 1}`
          : null;
      lastPage = `${this.baseURL}/${this.prefix}/${maxPage}`;
      previousPage =
        page - 1 > 0 ? `${this.baseURL}/${this.prefix}/${page - 1}}` : null;
    }
    return {
      items,
      metadata: {
        totalItems,
        itemCount: items.length,
        itemPerPage: limit,
        totalPages: getTotalPages(items.length, limit),
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
