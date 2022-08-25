import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { categoryStatus } from 'src/commons/enum.common';
import { getPageNumber } from 'src/utils/number.util';
import { ServiceUtil } from 'src/utils/service.util';
import { DataSource, Repository } from 'typeorm';
import { UploadService } from '../uploads/upload.service';
import { Category } from './category.entity';
import { UpdateCategoryValidator } from './category.validator';

@Injectable()
export class CategoryService extends ServiceUtil<
  Category,
  Repository<Category>
> {
  constructor(
    private dataSource: DataSource,
    private uploadService: UploadService,
  ) {
    super(dataSource.getRepository(Category));
  }

  async getAllCategories(page: number): Promise<any> {
    if (page == 0)
      throw new HttpException('Page is not valid', HttpStatus.BAD_REQUEST);
    const countResult = await this.repository.findAndCount();
    const countNumber = countResult[1];
    const totalPage = getPageNumber(countNumber);
    const categories = await this.repository
      .createQueryBuilder('category')
      .offset((page - 1) * 20)
      .limit(20)
      .getMany();
    if (categories.length == 0) {
      throw new HttpException('Out of range', HttpStatus.BAD_REQUEST);
    }
    return {
      page,
      totalPage,
      categories,
    };
  }

  async getAllActiveCategories(page): Promise<any> {
    if (page == 0)
      throw new HttpException('Page is not valid', HttpStatus.BAD_REQUEST);
    const countResult = await this.repository.findAndCount();
    const countNumber = countResult[1];
    const totalPage = getPageNumber(countNumber);
    const categories = await this.repository
      .createQueryBuilder('category')
      .where('status=:status', { status: categoryStatus.ACTIVE })
      .offset((page - 1) * 20)
      .limit(20)
      .getMany();
    if (categories.length == 0) {
      throw new HttpException('Out of range', HttpStatus.BAD_REQUEST);
    }
    return {
      page,
      totalPage,
      categories,
    };
  }

  async addCategory(categoryInfo, file: Express.Multer.File) {
    let url;
    const exist = await this.repository
      .createQueryBuilder('category')
      .where(`LOWER(name) = LOWER(:name)`, { name: categoryInfo.name })
      .getOne();
    if (exist)
      throw new HttpException(
        'Category name already exist',
        HttpStatus.BAD_REQUEST,
      );
    if (file) {
      const uploaded = await this.uploadService.uploadToCloudinary(file);
      url = uploaded.url;
    }
    const category = new Category(
      categoryInfo.name,
      url,
      categoryInfo.status as categoryStatus,
    );
    await this.repository.insert(category);
  }

  async updateCategory(
    categoryId,
    categoryInfo: UpdateCategoryValidator,
    file: Express.Multer.File,
  ) {
    let url;
    const category = await this.findOneByCondition({
      where: { pkCategory: categoryId },
    });
    if (category.name.toLowerCase() === categoryInfo.name.toLowerCase()) {
      throw new HttpException(
        `Category name already exist`,
        HttpStatus.BAD_REQUEST,
      );
    }
    if (file) {
      const uploaded = await this.uploadService.uploadToCloudinary(file);
      url = uploaded.url;
    }
    const { name, status } = categoryInfo;
    const banner = url;
    const newCategory = new Category(name, banner, status as categoryStatus);
    await this.repository.update({ pkCategory: categoryId }, newCategory);
  }
}
