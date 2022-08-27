import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { accountRole } from 'src/commons/enum.common';
import { Roles } from '../decorators/roles.decorator';
import { RolesGuard } from '../guards/roles.guards';
import { CategoryInterceptor } from '../interceptors/category.interceptor';
import { CategoryService } from './category.service';
import * as dto from './category.validator';

@Controller('categories')
@ApiTags('Categories')
export class CategoryController {
  fileSchema = {};
  constructor(private categoryService: CategoryService) {}
  @ApiParam({ name: 'page' })
  @ApiBearerAuth()
  @Get('/alls/:page')
  @Roles(accountRole.STAFF, accountRole.SUPERUSER)
  @UseGuards(RolesGuard)
  async getAllCategories(@Param() params) {
    return this.categoryService.getAllCategories(params.page as number);
  }

  @Get('/active/:page')
  @ApiParam({ name: 'page' })
  @UseInterceptors(CategoryInterceptor)
  async getAllActiveCategories(@Param() params) {
    return this.categoryService.getAllActiveCategories(Number(params.page));
  }

  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['name', 'status', 'banner'],
      properties: {
        name: {
          type: 'string',
        },
        status: {
          type: 'string',
        },
        banner: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @Post()
  @Roles(accountRole.SUPERUSER, accountRole.STAFF)
  @UseGuards(RolesGuard)
  @UseInterceptors(FileInterceptor('banner'))
  async addCategory(
    @Body() category: dto.CategoryDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.categoryService.addCategory(category, file);
  }

  @ApiParam({ name: 'categoryId' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
        },
        status: {
          type: 'string',
        },
        banner: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiBearerAuth()
  @Put(':categoryId')
  @Roles(accountRole.SUPERUSER, accountRole.STAFF)
  @UseGuards(RolesGuard)
  @UseInterceptors(FilesInterceptor('banner'))
  async updateCategory(
    @Param() params,
    @UploadedFile() file: Express.Multer.File,
    @Body() category: dto.UpdateCategoryDto,
  ) {
    return this.categoryService.updateCategory(
      params.categoryId,
      category,
      file,
    );
  }
}
