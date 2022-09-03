import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiExtraModels,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Role } from '../../commons/enum.common';
import { RequireRoles } from '../../decorators/bind-role.decorator';
import { AuthGuard } from '../../guards/auth.guard';
import { RoleGuard } from '../../guards/role.guard';
import { AddSaleProductDto } from './sale-product.dto';
import { SaleProductService } from './sale-product.service';

@Controller('sale-products')
@ApiTags('Sale products')
@ApiBadRequestResponse()
@ApiOkResponse()
export class SaleProductController {
  constructor(private saleProductService: SaleProductService) {}
  @ApiExtraModels(AddSaleProductDto)
  @Post()
  @UseGuards(AuthGuard, RoleGuard)
  @RequireRoles(Role.STAFF, Role.SUPERUSER)
  async addSaleProduct(@Body() body: AddSaleProductDto): Promise<void> {
    return this.saleProductService.addSaleProduct(body);
  }
}
