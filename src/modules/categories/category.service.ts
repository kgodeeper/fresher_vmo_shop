import { forwardRef, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Status } from '../../commons/enum.common';
import { ServiceUtil } from '../../utils/service.utils';
import { DataSource, Repository } from 'typeorm';
import { AddCategoryDto } from './category.dto';
import { Category } from './category.entity';
import { AppHttpException } from '../../exceptions/http.exception';
import { UploadService } from '../uploads/upload.service';
import {
  bindFilterQuery,
  bindForceQuery,
  bindSearchQuery,
  bindSortQuery,
  combineFilter,
  combineSearch,
  combineSort,
  getPublicId,
} from '../../utils/string.util';
import {
  getAllForceOptions,
  getAllForces,
  getAllJoinOptions,
  IPaginate,
  IPagination,
} from '../../utils/interface.util';
import { RedisCacheService } from '../caches/cache.service';
import { MAX_ELEMENTS_OF_PAGE } from '../../commons/const.common';
import { getTotalPages } from '../../utils/number.util';
import { PaginationService } from '../paginations/pagination.service';
import { ProductService } from '../products/product.service';

@Injectable()
export class CategoryService extends ServiceUtil<
  Category,
  Repository<Category>
> {
  constructor(
    private dataSource: DataSource,
    @Inject(forwardRef(() => ProductService))
    private productService: ProductService,
    private cacheService: RedisCacheService,
    private uploadSerivice: UploadService,
    private paginationService: PaginationService<Category>,
  ) {
    super(dataSource.getRepository(Category));
  }

  async addCategory(
    categoryInfo: AddCategoryDto,
    file: Express.Multer.File,
  ): Promise<void> {
    // by default, position of new category is largest position of active category in db
    const maxPosition = await this.getMaxPosition();
    const lastPosition = Number(maxPosition?.maxPos) + 1;
    const existCategory = await this.getExistCategory(categoryInfo.name);
    if (existCategory) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        `Category with this name already exist`,
      );
    }
    /**
     * upload file to cloundinary
     */
    const uploaded = await this.uploadSerivice.uploadToCloudinary(
      file,
      'categories',
    );
    const category = new Category(
      categoryInfo.name,
      uploaded.url,
      Status.ACTIVE,
      lastPosition,
    );
    await this.repository.insert(category);
    /**
     * cache quantity of category
     */
    await this.cacheService.updateQuantityValue('shop:all:categories', 1);
    await this.cacheService.updateQuantityValue('shop:active:categories', 1);
  }

  async updateCategory(
    id: string,
    name?: string,
    file?: Express.Multer.File,
  ): Promise<void> {
    if (!name && !file) {
      throw new AppHttpException(HttpStatus.BAD_REQUEST, 'Nothing to update');
    }
    const existCategory = await this.checkCategoryById(id);
    let banner = existCategory.banner;
    if (name) {
      const existName = await this.getExistCategory(name);
      if (existName) {
        throw new AppHttpException(
          HttpStatus.BAD_REQUEST,
          'Category with this name already exist',
        );
      }
      existCategory.name = name;
    }
    if (file) {
      await this.uploadSerivice.removeFromCloudinary(
        getPublicId(existCategory.banner),
        'categories',
      );
      const uploaded = await this.uploadSerivice.uploadToCloudinary(
        file,
        'categories',
      );
      banner = uploaded.url;
    }
    existCategory.banner = banner;
    await existCategory.save();
  }

  async swapPosition(sourceId: string, destinationId: string): Promise<void> {
    const sourceCategory = await this.checkCategoryById(sourceId);
    const destinationCategory = await this.checkCategoryById(destinationId);
    const temp = sourceCategory.position;
    sourceCategory.position = destinationCategory.position;
    destinationCategory.position = temp;
    await sourceCategory.save();
    await destinationCategory.save();
  }

  async changeCategoryStatus(id: string): Promise<void> {
    const existCategory = await this.getCategory(id);
    if (existCategory.status === Status.ACTIVE) {
      const canChange = !(await this.productService.checkProductInCategory(id));
      if (!canChange) {
        throw new AppHttpException(
          HttpStatus.BAD_REQUEST,
          'Cant change status when category have active product',
        );
      }
      existCategory.status = Status.INACTIVE;
    } else {
      existCategory.status = Status.ACTIVE;
    }
    await existCategory.save();
  }

  async getActiveCategory(
    page: number,
    pLimit?: string,
    search?: string,
    sort?: string,
    filter?: string,
  ): Promise<IPagination<Category>> {
    /**
     * check valid page
     */
    if (page <= 0 || !page) page = 1;
    let limit = 25;
    if (Number(pLimit) !== NaN && Number(pLimit) >= 0) limit = Number(pLimit);
    const forceTargets: getAllForceOptions = {
      forces: [
        {
          column: 'status',
          condition: 'active',
        },
      ],
    };
    let totals = [];
    try {
      totals = await this.getAlls(search, sort, filter, forceTargets);
    } catch {}
    const total = totals.length;
    const elements = totals.splice((page - 1) * limit, page * limit);
    this.paginationService.setPrefix('categories/active');
    return this.paginationService.getResponseObject(
      elements,
      total,
      page,
      limit,
      search,
      sort,
      filter,
      null,
    );
  }

  async getAllCategories(
    page: number,
    pLimit?: string,
    search?: string,
    sort?: string,
    filter?: string,
  ): Promise<IPagination<Category>> {
    /**
     * check valid page
     */
    if (page <= 0 || !page) page = 1;
    let limit = 25;
    if (Number(pLimit) !== NaN && Number(pLimit) >= 0) limit = Number(pLimit);
    let totals = [];
    try {
      totals = await this.getAlls(search, sort, filter);
    } catch {}
    const total = totals.length;
    const elements = totals.splice((page - 1) * limit, page * limit);
    this.paginationService.setPrefix('categories/active');
    return this.paginationService.getResponseObject(
      elements,
      total,
      page,
      limit,
      search,
      sort,
      filter,
      null,
    );
  }

  async checkCategoryById(id: string): Promise<Category> {
    const existCategory = await this.findOneByCondition({ pkCategory: id });
    if (!existCategory) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        'Category with this id is not exist',
      );
    }
    if (existCategory.status !== Status.ACTIVE) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        `Category ${id} was ${existCategory.status}`,
      );
    }
    return existCategory;
  }

  async getCategory(id: string): Promise<Category> {
    const existCategory = await this.findOneByCondition({ pkCategory: id });
    if (!existCategory) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        'Category with this id is not exist',
      );
    }
    return existCategory;
  }

  async getMaxPosition(): Promise<any> {
    return this.repository
      .createQueryBuilder()
      .select('MAX("position") as "maxPos"')
      .getRawOne();
  }

  async getExistCategory(name: string): Promise<any> {
    return this.repository
      .createQueryBuilder()
      .where('LOWER(name) = LOWER(:name)', {
        name,
      })
      .getOne();
  }

  async getById(id: string): Promise<Category> {
    return this.repository.findOne({ where: { pkCategory: id } });
  }

  async checkCategory(id: string): Promise<Category> {
    const existCategory = await this.getById(id);
    if (!existCategory) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        `Category with this id is not exist`,
      );
    }
    if (existCategory.status !== Status.ACTIVE) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        `Category was ${existCategory.status}`,
      );
    }
    return existCategory;
  }

  async deleteCategory(id: string): Promise<void> {
    const existCategory = await this.getCategory(id);
    const canChange = !(await this.productService.checkProductInCategory(id));
    if (!canChange) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        'Cant remove when category have active products',
      );
    }
    await this.repository.softDelete(existCategory.pkCategory);
  }
}
