import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { IPaginate, IPagination } from '../../utils/interface.util';
import { UuidDto } from '../../commons/dto.common';
import { Role } from '../../commons/enum.common';
import { RequireRoles } from '../../decorators/bind-role.decorator';
import { AuthGuard } from '../../guards/auth.guard';
import { RoleGuard } from '../../guards/role.guard';
import { AddCategoryDto } from './category.dto';
import { Category } from './category.entity';
import { CategoryService } from './category.service';
import { QueryResult } from 'typeorm';

@Controller('categories')
@ApiTags('Categories')
@ApiOkResponse()
@ApiBadRequestResponse()
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['name', 'banner'],
      properties: {
        name: { type: 'string' },
        banner: { type: 'string', format: 'binary' },
      },
    },
  })
  @Post()
  @UseGuards(AuthGuard, RoleGuard)
  @RequireRoles(Role.SUPERUSER, Role.STAFF)
  @UseInterceptors(FileInterceptor('banner'))
  async addCategory(
    @Body() body: AddCategoryDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<void> {
    return this.categoryService.addCategory(body, file);
  }

  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiParam({
    name: 'id',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        banner: {
          type: 'string',
          format: 'binary',
        },
        name: {
          type: 'string',
        },
      },
    },
  })
  @Patch(':id')
  @UseGuards(AuthGuard, RoleGuard)
  @RequireRoles(Role.SUPERUSER, Role.STAFF)
  @UseInterceptors(FileInterceptor('banner'))
  async updateCategory(
    @Body() body: { name: string },
    @Param() params: UuidDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<void> {
    return this.categoryService.updateCategory(params.id, body.name, file);
  }

  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
  })
  @Patch('swap/:id')
  @UseGuards(AuthGuard, RoleGuard)
  @RequireRoles(Role.STAFF, Role.SUPERUSER)
  async swapCategoryPosition(@Param() params: UuidDto, @Body() body: UuidDto) {
    return this.categoryService.swapPosition(params.id, body.id);
  }

  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
  })
  @Patch('status/:id')
  @UseGuards(AuthGuard, RoleGuard)
  @RequireRoles(Role.STAFF, Role.SUPERUSER)
  async changeCategorySttus(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    return this.categoryService.changeCategoryStatus(id);
  }

  @Get('')
  @ApiQuery({
    name: 'page',
    required: true,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
  })
  @ApiQuery({
    name: 'search',
    required: false,
  })
  @ApiQuery({
    name: 'sort',
    required: false,
  })
  @ApiQuery({
    name: 'filter',
    required: false,
  })
  async getActiveCategory(
    @Query('page', new ParseIntPipe()) page: number,
    @Query('limit') limit: string,
    @Query('search') search: string,
    @Query('sort') sort: string,
    @Query('filter') filter: string,
  ): Promise<IPagination<Category>> {
    return this.categoryService.getActiveCategory(
      page,
      limit,
      search,
      sort,
      filter,
    );
  }

  @Get('/all')
  @ApiQuery({
    name: 'page',
    required: true,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
  })
  @ApiQuery({
    name: 'search',
    required: false,
  })
  @ApiQuery({
    name: 'sort',
    required: false,
  })
  @ApiQuery({
    name: 'filter',
    required: false,
  })
  async getAllCategories(
    @Query('page', new ParseIntPipe()) page: number,
    @Query('limit') limit: string,
    @Query('search') search: string,
    @Query('sort') sort: string,
    @Query('filter') filter: string,
  ): Promise<IPagination<Category>> {
    return this.categoryService.getAllCategories(
      page,
      limit,
      search,
      sort,
      filter,
    );
  }
}
