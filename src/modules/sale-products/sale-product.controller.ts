import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiExtraModels,
  ApiOkResponse,
} from '@nestjs/swagger';
import { AddSaleProductDto } from './sale-product.dto';
import { SaleProductService } from './sale-product.service';

@Controller('sale-products')
@ApiBadRequestResponse()
@ApiOkResponse()
export class SaleProductController {
  constructor(private saleProductService: SaleProductService) {}
  @ApiExtraModels(AddSaleProductDto)
  @Post()
  async addSaleProduct(@Body() body: AddSaleProductDto): Promise<void> {
    return this.saleProductService.addSaleProduct(body);
  }
}
