import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { accountRole } from 'src/commons/enum.common';
import { Roles } from '../decorators/roles.decorator';
import { RolesGuard } from '../guards/roles.guards';
import { CategoryService } from './category.service';
import {
  CategoryValidator,
  UpdateCategoryValidator,
} from './category.validator';

@Controller('categories')
export class CategoryController {
  constructor(private categoryService: CategoryService) {}
  @Get('/alls/:page')
  @Roles(accountRole.STAFF, accountRole.SUPERUSER)
  @UseGuards(RolesGuard)
  async getAllCategories(@Param() params) {
    return this.categoryService.getAllCategories(params.page as number);
  }

  @Get('/active/:page')
  async getAllActiveCategories(@Param() params) {
    return this.categoryService.getAllActiveCategories(params.page);
  }

  @Post()
  @Roles(accountRole.SUPERUSER, accountRole.STAFF)
  @UseGuards(RolesGuard)
  @UseInterceptors(FileInterceptor('banner'))
  async addCategory(
    @Body() category: CategoryValidator,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.categoryService.addCategory(category, file);
  }

  @Put(':categoryID')
  @Roles(accountRole.SUPERUSER, accountRole.STAFF)
  @UseGuards(RolesGuard)
  @UseInterceptors(FilesInterceptor('banner'))
  async changeCategoryStatus(
    @Param() params,
    @UploadedFile() file: Express.Multer.File,
    @Body() category: UpdateCategoryValidator,
  ) {
    return this.categoryService.updateCategory(
      params.categoryID,
      category,
      file,
    );
  }
}
