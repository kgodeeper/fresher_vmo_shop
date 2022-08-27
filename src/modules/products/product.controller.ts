import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { accountRole, commonStatus } from 'src/commons/enum.common';
import { Roles } from '../decorators/roles.decorator';
import { RolesGuard } from '../guards/roles.guards';
import { ProductService } from './product.service';
import {
  ProductIdValidator,
  ProductValidator,
  StatusValidator,
  UpdateProductValidator,
} from './product.validator';

@Controller('products')
@ApiTags('Products')
export class ProductController {
  constructor(private productService: ProductService) {}
  @Post()
  @Roles(accountRole.STAFF, accountRole.SUPERUSER)
  @UseGuards(RolesGuard)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'avatar', maxCount: 1 },
      { name: 'barcode', maxCount: 1 },
    ]),
  )
  async createProduct(@Body() body: ProductValidator, @UploadedFiles() files) {
    return this.productService.createProduct(body, files.barcode, files.avatar);
  }

  @Get('alls/:page')
  @Roles(accountRole.STAFF, accountRole.SUPERUSER)
  @UseGuards(RolesGuard)
  async getAllProduct(@Param() params) {
    return this.productService.getAllProduct(params.page);
  }

  @Put(':productId')
  @Roles(accountRole.STAFF, accountRole.SUPERUSER)
  @UseGuards(RolesGuard)
  async changeStatus(
    @Body() body: StatusValidator,
    @Param() params: ProductIdValidator,
  ) {
    return this.productService.changeStatus(
      body.status as commonStatus,
      params.productId,
    );
  }
}
