import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
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
import { IPaginate, IPagination } from 'src/utils/interface.util';
import { UuidDto } from '../../commons/dto.common';
import { Role } from '../../commons/enum.common';
import { RequireRoles } from '../../decorators/bind-role.decorator';
import { AuthGuard } from '../../guards/auth.guard';
import { RoleGuard } from '../../guards/role.guard';
import { AddProductDto, UpdateProductDto } from './product.dto';
import { Product } from './product.entity';
import { ProductService } from './product.service';

@Controller('products')
@ApiTags('Products')
@ApiOkResponse()
@ApiBadRequestResponse()
export class ProductController {
  constructor(private productService: ProductService) {}

  @ApiForbiddenResponse()
  @ApiUnauthorizedResponse()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: [
        'category',
        'suplier',
        'name',
        'weight',
        'avatar',
        'barcode',
        'importPrice',
        'exportPrice',
      ],
      properties: {
        category: { type: 'string' },
        suplier: { type: 'string' },
        name: { type: 'string' },
        importPrice: { type: 'number' },
        exportPrice: { type: 'number' },
        weight: { type: 'number' },
        description: { type: 'string' },
        barcode: {
          type: 'string',
          format: 'binary',
        },
        avatar: {
          type: 'string',
          format: 'binary',
        },
        photos: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @ApiBearerAuth()
  @Post()
  @UseGuards(AuthGuard, RoleGuard)
  @RequireRoles(Role.STAFF, Role.SUPERUSER)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'avatar', maxCount: 1 },
      { name: 'barcode', maxCount: 1 },
      { name: 'photos', maxCount: 5 },
    ]),
  )
  async addProduct(
    @Body() body: AddProductDto,
    @UploadedFiles() files,
  ): Promise<void> {
    return this.productService.addProduct(
      files.barcode,
      files.avatar,
      files.photos,
      body,
    );
  }

  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'string' },
        category: { type: 'string' },
        suplier: { type: 'string' },
        name: { type: 'string' },
        importPrice: { type: 'string' },
        exportPrice: { type: 'string' },
        weight: { type: 'string' },
        description: { type: 'string' },
        barcode: { type: 'string', format: 'binary' },
        avatar: { type: 'string', format: 'binary' },
      },
    },
  })
  @Put()
  @UseGuards(AuthGuard, RoleGuard)
  @RequireRoles(Role.STAFF, Role.SUPERUSER)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'avatar', maxCount: 1 },
      { name: 'barcode', maxCount: 1 },
    ]),
  )
  async updateProduct(
    @UploadedFiles() files,
    @Body() body: UpdateProductDto,
  ): Promise<void> {
    return this.productService.updateProduct(body, files.barcode, files.avatar);
  }

  @ApiForbiddenResponse()
  @ApiUnauthorizedResponse()
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
  })
  @Delete(':id')
  @UseGuards(AuthGuard, RoleGuard)
  @RequireRoles(Role.STAFF, Role.SUPERUSER)
  async removeProduct(@Param() param: UuidDto): Promise<void> {
    return this.productService.removeProduct(param.id);
  }

  @ApiForbiddenResponse()
  @ApiUnauthorizedResponse()
  @ApiBearerAuth()
  @Get('all/:page')
  @UseGuards(AuthGuard, RoleGuard)
  @RequireRoles(Role.STAFF, Role.SUPERUSER)
  async getAllProducts(
    @Param('page', new ParseIntPipe()) page: number,
  ): Promise<IPaginate<Product>> {
    return this.productService.getAllProducts(page);
  }

  @Get('active')
  @ApiQuery({
    name: 'sort',
    required: false,
  })
  @ApiQuery({
    name: 'search',
    required: false,
  })
  @ApiQuery({
    name: 'filter',
    required: false,
  })
  @ApiQuery({
    name: 'page',
  })
  @ApiQuery({
    name: 'limit',
  })
  @ApiQuery({
    name: 'range',
  })
  async getAllActiveProducts(
    @Query('page', new ParseIntPipe()) page: number,
    @Query('limit') limit: string,
    @Query('search') search: string,
    @Query('sort') sort: string,
    @Query('filter') filter: string,
    @Query('range') range: string,
  ): Promise<IPagination<Product>> {
    return this.productService.getAllActiveProducts(
      page,
      limit,
      search,
      sort,
      filter,
      range,
    );
  }

  @ApiQuery({
    name: 'key',
  })
  @Get('search/:page')
  async searchProduct(
    @Query() query: { key: string },
    @Param('page', new ParseIntPipe()) page: number,
  ): Promise<IPaginate<Product>> {
    return this.productService.searchProduct(query.key, page);
  }

  @Get('filter/:page')
  @ApiParam({ name: 'page' })
  @ApiQuery({ name: 'suplier', required: false })
  @ApiQuery({ name: 'category', required: false })
  async filterProduct(
    @Param('page', new ParseIntPipe()) page: number,
    @Query() query,
  ): Promise<IPaginate<Product>> {
    return this.productService.filterProduct(
      query.category,
      query.suplier,
      page,
    );
  }

  @Get('detail/:id')
  async getDetailProduct(@Param() params: UuidDto): Promise<Product> {
    return this.productService.getDetailProduct(params.id);
  }
}
