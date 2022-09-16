import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiExtraModels,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { IPaginate } from '../../utils/interface.util';
import { Role } from '../../commons/enum.common';
import { RequireRoles } from '../../decorators/bind-role.decorator';
import { AuthGuard } from '../../guards/auth.guard';
import { RoleGuard } from '../../guards/role.guard';
import { AddSaleDto } from './sale.dto';
import { Sale } from './sale.entity';
import { SaleService } from './sale.service';

@Controller('sales')
@ApiTags('FlashSales')
@ApiOkResponse()
@ApiBadRequestResponse()
export class SaleController {
  constructor(private saleService: SaleService) {}
  @Post()
  @ApiBearerAuth()
  @ApiExtraModels(AddSaleDto)
  @UseGuards(AuthGuard, RoleGuard)
  @RequireRoles(Role.SUPERUSER, Role.STAFF)
  async addSale(@Body() body: AddSaleDto): Promise<void> {
    return this.saleService.addSale(body);
  }

  @ApiBearerAuth()
  @Get('all/:page')
  @UseGuards(AuthGuard, RoleGuard)
  @RequireRoles(Role.SUPERUSER, Role.STAFF)
  async getAllSale(
    @Param('page', new ParseIntPipe()) page: number,
  ): Promise<IPaginate<Sale>> {
    return this.saleService.getAllSales(page);
  }

  @Get('active/:page')
  async getActiveSale(
    @Param('page', new ParseIntPipe()) page: number,
  ): Promise<IPaginate<Sale>> {
    return this.saleService.getActiveSales(page);
  }

  @Get('current')
  async getCurrentSale(): Promise<Sale> {
    return this.saleService.getCurrentSale();
  }

  @Get('details/:id')
  @ApiParam({
    name: 'id',
    required: true,
  })
  async getSaleDetail(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<Sale> {
    return this.saleService.getSaleDetail(id);
  }
}
