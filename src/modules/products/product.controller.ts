import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  Put,
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
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UuidDto } from '../../commons/dto.common';
import { Role } from '../../commons/enum.common';
import { RequireRoles } from '../../decorators/bind-role.decorator';
import { AuthGuard } from '../../guards/auth.guard';
import { RoleGuard } from '../../guards/role.guard';
import { AddProductDto, UpdateProductDto } from './product.dto';
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
  //@UseGuards(AuthGuard, RoleGuard)
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
}
