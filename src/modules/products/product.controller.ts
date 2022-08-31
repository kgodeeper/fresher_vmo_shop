import {
  Body,
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConsumes,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AddProductDto } from './product.dto';
import { ProductService } from './product.service';

@Controller('products')
@ApiTags('Products')
export class ProductController {
  constructor(private productService: ProductService) {}
  @ApiOkResponse({
    description: 'Add product success',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthornized',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden',
  })
  @ApiBadRequestResponse({
    description: 'Add product failure',
  })
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
      },
    },
  })
  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'avatar', maxCount: 1 },
      { name: 'barcode', maxCount: 1 },
    ]),
  )
  async addProduct(
    @Body() body: AddProductDto,
    @UploadedFiles() files,
  ): Promise<void> {
    return this.productService.addProduct(files.barcode, files.avatar, body);
  }
}
