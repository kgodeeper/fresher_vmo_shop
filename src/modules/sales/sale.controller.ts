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
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { IPaginate, IPagination } from '../../utils/interface.util';
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

  @ApiQuery({
    name: 'page',
    required: true,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
  })
  @ApiQuery({
    name: 'search',
    required: false,
  })
  @ApiQuery({
    name: 'sort',
    required: false,
  })
  @ApiQuery({
    name: 'filter',
    required: false,
  })
  @ApiBearerAuth()
  @Get('all')
  @UseGuards(AuthGuard, RoleGuard)
  @RequireRoles(Role.SUPERUSER, Role.STAFF)
  async getAllSale(
    @Query('page', new ParseIntPipe()) page: number,
    @Query('limit') limit: string,
    @Query('search') search: string,
    @Query('sort') sort: string,
    @Query('filter') filter: string,
  ): Promise<IPagination<Sale>> {
    return this.saleService.getAllSales(page, limit, search, sort, filter);
  }

  @ApiQuery({
    name: 'page',
    required: true,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
  })
  @Get('future')
  async getFutureSale(
    @Query('page', new ParseIntPipe()) page: number,
    @Query('limit') limit: string,
  ): Promise<IPagination<Sale>> {
    return this.saleService.getFutureSales(page, limit);
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
