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
import { IPagination } from 'src/utils/interface.util';
import { GetResourceDto, UuidDto } from '../../commons/dto.common';
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
  @ApiBearerAuth()
  @Post()
  @UseGuards(AuthGuard, RoleGuard)
  @RequireRoles(Role.STAFF, Role.SUPERUSER)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'avatar', maxCount: 1 },
      { name: 'photos', maxCount: 5 },
    ]),
  )
  async addProduct(
    @Body() body: AddProductDto,
    @UploadedFiles() files,
  ): Promise<void> {
    return this.productService.addProduct(files.avatar, files.photos, body);
  }

  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @Put()
  @UseGuards(AuthGuard, RoleGuard)
  @RequireRoles(Role.STAFF, Role.SUPERUSER)
  @UseInterceptors(FileFieldsInterceptor([{ name: 'avatar', maxCount: 1 }]))
  async updateProduct(
    @UploadedFiles() files,
    @Body() body: UpdateProductDto,
  ): Promise<void> {
    return this.productService.updateProduct(body, files.avatar);
  }

  @ApiForbiddenResponse()
  @ApiUnauthorizedResponse()
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
  })
  @Patch(':id')
  @UseGuards(AuthGuard, RoleGuard)
  @RequireRoles(Role.STAFF, Role.SUPERUSER)
  async removeProduct(@Param() param: UuidDto): Promise<void> {
    return this.productService.changeProductStatus(param.id);
  }

  @Get('all')
  @ApiQuery({ name: 'range', required: false })
  async getAllProducts(
    @Query() query: GetResourceDto,
    @Query('range') range: string,
  ): Promise<IPagination<Product>> {
    return this.productService.getAllProducts(
      query.page,
      query.limit,
      query.search,
      query.sort,
      query.filter,
      range,
    );
  }

  @Get('')
  @ApiQuery({ name: 'range', required: false })
  async getAllActiveProducts(
    @Query() query: GetResourceDto,
    @Query('range') range: string,
  ): Promise<IPagination<Product>> {
    return this.productService.getAllActiveProducts(
      query.page,
      query.limit,
      query.search,
      query.sort,
      query.filter,
      range,
    );
  }

  @Get('detail/:id')
  async getDetailProduct(@Param() params: UuidDto): Promise<Product> {
    return this.productService.getDetailProduct(params.id);
  }

  @ApiBearerAuth()
  @ApiBadRequestResponse()
  @ApiUnauthorizedResponse()
  @UseGuards(AuthGuard, RoleGuard)
  @RequireRoles(Role.CUSTOMER, Role.SUPERUSER)
  @Delete(':id')
  async deleteProduct(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.productService.deleteProduct(id);
  }
}
