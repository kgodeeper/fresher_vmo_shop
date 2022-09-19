import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiExtraModels,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { GetResourceDto } from '../../commons/dto.common';
import { IPagination } from 'src/utils/interface.util';
import { Role } from '../../commons/enum.common';
import { RequireRoles } from '../../decorators/bind-role.decorator';
import { AuthGuard } from '../../guards/auth.guard';
import { RoleGuard } from '../../guards/role.guard';
import { AddSaleProductDto } from './sale-product.dto';
import { SaleProduct } from './sale-product.entity';
import { SaleProductService } from './sale-product.service';

@Controller('sale-products')
@ApiTags('Sale products')
@ApiBadRequestResponse()
@ApiOkResponse()
export class SaleProductController {
  constructor(private saleProductService: SaleProductService) {}

  @ApiBearerAuth()
  @Post()
  @UseGuards(AuthGuard, RoleGuard)
  @RequireRoles(Role.STAFF, Role.SUPERUSER)
  async addSaleProduct(@Body() body: AddSaleProductDto): Promise<void> {
    return this.saleProductService.addSaleProduct(body);
  }

  @Get(':sale')
  async getCurrentSaleProduct(
    @Param('sale', ParseUUIDPipe) sale: string,
    @Query() query: GetResourceDto,
  ): Promise<IPagination<SaleProduct>> {
    return this.saleProductService.getCurrentSaleProduct(
      sale,
      query.page,
      query.limit,
      query.search,
      query.sort,
      query.filter,
    );
  }
}
