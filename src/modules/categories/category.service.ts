import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { commonStatus } from 'src/commons/enum.common';
import { Paginate } from 'src/utils/interface.util';
import { getPageNumber } from 'src/utils/number.util';
import { ServiceUtil } from 'src/utils/service.util';
import { DataSource, Repository } from 'typeorm';
import { RedisCacheService } from '../caches/cache.service';
import { AppHttpException } from '../exceptions/http.exceptions';
import { UploadService } from '../uploads/upload.service';
import { Category } from './category.entity';
import { UpdateCategoryDto } from './category.validator';

@Injectable()
export class CategoryService extends ServiceUtil<
  Category,
  Repository<Category>
> {
  constructor(
    private dataSource: DataSource,
    private configService: ConfigService,
    @Inject(RedisCacheService)
    private cacheService: RedisCacheService,
    private uploadService: UploadService,
  ) {
    super(dataSource.getRepository(Category));
  }

  async getAllCategories(page: number): Promise<Paginate<Category>> {
    if (page == 0) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        'Page number is not valid',
      );
    }
    const totalElements = Number(
      await this.cacheService.get(
        this.configService.get<string>('CATEGORY_ALL_KEY'),
      ),
    );
    const totalPages = getPageNumber(totalElements);
    const categories = await this.repository
      .createQueryBuilder('category')
      .offset((page - 1) * 20)
      .limit(20)
      .getMany();
    if (categories.length == 0) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        'Page number is out of range',
      );
    }
    return {
      page,
      totalPages,
      totalElements,
      elements: categories,
    };
  }

  async getAllActiveCategories(page: number): Promise<Paginate<Category>> {
    if (page <= 0) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        'Page number is not valid',
      );
    }
    const totalElements = Number(
      await this.cacheService.get(
        this.configService.get<string>('CATEGORY_ACTIVE_KEY'),
      ),
    );
    const totalPages = getPageNumber(totalElements);
    const categories = await this.repository
      .createQueryBuilder('category')
      .where('status=:status', { status: commonStatus.ACTIVE })
      .offset((page - 1) * 20)
      .limit(20)
      .getMany();
    if (categories.length == 0) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        'Page number is out of range',
      );
    }
    return {
      page,
      totalPages,
      totalElements,
      elements: categories,
    } as Paginate<Category>;
  }

  async addCategory(categoryInfo, file: Express.Multer.File) {
    let url;
    const exist = await this.repository
      .createQueryBuilder('category')
      .where(`LOWER(name) = LOWER(:name)`, { name: categoryInfo.name })
      .getOne();
    if (exist)
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        'Category with this name already exist',
      );
    if (file) {
      const uploaded = await this.uploadService.uploadToCloudinary(file);
      url = uploaded.url;
    }
    const category = new Category(
      categoryInfo.name,
      url,
      categoryInfo.status as commonStatus,
    );
    await this.repository.insert(category);
    const status = categoryInfo.status;
    /**
     * Cahe quantity of category
     */
    await this.cacheService.changeValue(
      this.configService.get<string>('CATEGORY_ALL_KEY'),
      1,
      Infinity,
    );
    if (status == commonStatus.ACTIVE) {
      await this.cacheService.changeValue(
        this.configService.get<string>('CATEGORY_ACTIVE_KEY'),
        1,
        Infinity,
      );
    }
  }

  async updateCategory(
    categoryId,
    categoryInfo: UpdateCategoryDto,
    file: Express.Multer.File,
  ) {
    let url;
    const category = await this.findOneByCondition({
      where: { pkCategory: categoryId },
    });
    const oldStatus = category.status;
    const { name, status } = categoryInfo;
    if (!name && !status) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        'No information to update',
      );
    }
    if (category.name.toLowerCase() === categoryInfo.name.toLowerCase()) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        'Category with this name already exist',
      );
    }
    if (file) {
      const uploaded = await this.uploadService.uploadToCloudinary(file);
      url = uploaded.url;
    }
    const banner = url;
    const newCategory = new Category(name, banner, status as commonStatus);
    await this.repository.update({ pkCategory: categoryId }, newCategory);
    /**
     * Cache category active after update
     */
    if (oldStatus === commonStatus.INACTIVE && status === commonStatus.ACTIVE) {
      await this.cacheService.changeValue(
        this.configService.get<string>('CATEGORY_ACTIVE_KEY'),
        1,
        Infinity,
      );
    } else if (
      oldStatus === commonStatus.ACTIVE &&
      status === commonStatus.INACTIVE
    ) {
      await this.cacheService.changeValue(
        this.configService.get<string>('CATEGORY_ACTIVE_KEY'),
        -1,
        Infinity,
      );
    }
  }
}
