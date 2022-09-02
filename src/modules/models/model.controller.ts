import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiExtraModels,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AddProductModelDto } from './model.dto';
import { ProductModelService } from './model.service';

@Controller('models')
@ApiTags('Models')
@ApiOkResponse()
@ApiBadRequestResponse()
export class ProductModelController {
  constructor(private productModelService: ProductModelService) {}

  @ApiExtraModels(AddProductModelDto)
  @Post()
  async addProductModel(@Body() body: AddProductModelDto): Promise<void> {
    return this.productModelService.addProductModel(body);
  }
}
