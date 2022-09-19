import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
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
import { GetResourceDto, UuidDto } from '../../commons/dto.common';
import { Role } from '../../commons/enum.common';
import { RequireRoles } from '../../decorators/bind-role.decorator';
import { AuthGuard } from '../../guards/auth.guard';
import { RoleGuard } from '../../guards/role.guard';
import { AddCategoryDto, updateCategoryDto } from './category.dto';
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
  @Put(':id')
  @UseGuards(AuthGuard, RoleGuard)
  @RequireRoles(Role.SUPERUSER, Role.STAFF)
  @UseInterceptors(FileInterceptor('banner'))
  async updateCategory(
    @Body() body: updateCategoryDto,
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
  async getActiveCategory(
    @Query() query: GetResourceDto,
  ): Promise<IPagination<Category>> {
    return this.categoryService.getActiveCategory(
      query.page,
      query.limit,
      query.search,
      query.sort,
      query.filter,
    );
  }

  @Get('/all')
  async getAllCategories(
    @Query() query: GetResourceDto,
  ): Promise<IPagination<Category>> {
    return this.categoryService.getAllCategories(
      query.page,
      query.limit,
      query.search,
      query.sort,
      query.filter,
    );
  }

  @ApiBearerAuth()
  @ApiBadRequestResponse()
  @ApiForbiddenResponse()
  @Delete(':id')
  @UseGuards(AuthGuard, RoleGuard)
  @RequireRoles(Role.SUPERUSER, Role.STAFF)
  async deleteCategory(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.categoryService.deleteCategory(id);
  }
}
