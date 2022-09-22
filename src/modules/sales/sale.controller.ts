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
import { IPagination } from '../../utils/interface.util';
import { Role } from '../../commons/enum.common';
import { RequireRoles } from '../../decorators/bind-role.decorator';
import { AuthGuard } from '../../guards/auth.guard';
import { RoleGuard } from '../../guards/role.guard';
import { AddSaleDto, GetFutureDto } from './sale.dto';
import { Sale } from './sale.entity';
import { SaleService } from './sale.service';
import { GetResourceDto } from '../../commons/dto.common';

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
  @Get('all')
  @UseGuards(AuthGuard, RoleGuard)
  @RequireRoles(Role.SUPERUSER, Role.STAFF)
  async getAllSale(@Query() query: GetResourceDto): Promise<IPagination<Sale>> {
    return this.saleService.getAllSales(
      query.page,
      query.limit,
      query.search,
      query.sort,
      query.filter,
    );
  }

  @Get('future')
  async getFutureSale(
    @Query() query: GetFutureDto,
  ): Promise<IPagination<Sale>> {
    return this.saleService.getFutureSales(query.page, query.limit);
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

  @Get('current')
  async getCurrentSale(): Promise<Sale> {
    return this.saleService.getCurrentSale();
  }
}
