import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiExtraModels,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UserBound } from '../../decorators/bind-user.decorator';
import { Role } from '../../commons/enum.common';
import { RequireRoles } from '../../decorators/bind-role.decorator';
import { AuthGuard } from '../../guards/auth.guard';
import { RoleGuard } from '../../guards/role.guard';
import { OrderService } from './order.service';
import { IPaginate, IPagination } from '../../utils/interface.util';
import { Order } from './order.entity';
import { ChangeOrderStatusDto, OrderDto } from './order.dto';
import { GetResourceDto } from '../../commons/dto.common';
import { QueryResult } from 'typeorm';

@Controller('orders')
@ApiTags('Orders')
@ApiOkResponse()
@ApiBadRequestResponse()
export class OrderController {
  constructor(private orderService: OrderService) {}

  @ApiForbiddenResponse()
  @ApiUnauthorizedResponse()
  @ApiBearerAuth()
  @Post()
  @UseGuards(AuthGuard, RoleGuard)
  @RequireRoles(Role.CUSTOMER)
  async customerOrder(
    @Body()
    body: OrderDto,
    @UserBound() username: string,
  ): Promise<void> {
    return this.orderService.customerOrder(
      body.couponId,
      body.deliveryId,
      body.carts,
      username,
    );
  }

  @Get('own')
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RoleGuard)
  @RequireRoles(Role.CUSTOMER)
  @ApiQuery({ name: 'range', required: false })
  async getOwnOrders(
    @Query() query: GetResourceDto,
    @Query('range') range: string,
    @UserBound() username: string,
  ): Promise<IPagination<Order>> {
    return this.orderService.getOwnOrders(
      query.page,
      query.limit,
      query.search,
      query.sort,
      query.filter,
      range,
      username,
    );
  }

  @Get('all')
  @ApiBearerAuth()
  @ApiQuery({ name: 'range', required: false })
  @UseGuards(AuthGuard, RoleGuard)
  @RequireRoles(Role.STAFF, Role.SUPERUSER)
  async getAllOrders(
    @Query() query: GetResourceDto,
    @Query('range') range: string,
  ): Promise<IPagination<Order>> {
    return this.orderService.getAllOrders(
      query.page,
      query.limit,
      query.search,
      query.sort,
      query.filter,
      range,
    );
  }

  @ApiForbiddenResponse()
  @ApiUnauthorizedResponse()
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RoleGuard)
  @RequireRoles(Role.CUSTOMER)
  @Get('detail/:id')
  async customerGetDetails(
    @Param('id', new ParseUUIDPipe()) id: string,
    @UserBound() username: string,
  ): Promise<Order> {
    return this.orderService.customerGetDetails(username, id);
  }

  @ApiForbiddenResponse()
  @ApiUnauthorizedResponse()
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RoleGuard)
  @RequireRoles(Role.CUSTOMER)
  @Get('complete/:id')
  async customerCompleteOrder(
    @Param('id', new ParseUUIDPipe()) id: string,
    @UserBound() username: string,
  ): Promise<void> {
    return this.orderService.customerCompleteOrder(username, id);
  }

  @ApiForbiddenResponse()
  @ApiUnauthorizedResponse()
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RoleGuard)
  @RequireRoles(Role.STAFF, Role.SUPERUSER)
  @Put('status/:id')
  async changeStatus(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: ChangeOrderStatusDto,
  ): Promise<void> {
    return this.orderService.changeStatus(body.status, id);
  }

  @ApiForbiddenResponse()
  @ApiUnauthorizedResponse()
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RoleGuard)
  @RequireRoles(Role.CUSTOMER)
  @Post('cancel/:id')
  async cancelOrder(
    @Param('id', new ParseUUIDPipe()) id: string,
    @UserBound() username,
  ): Promise<void> {
    return this.orderService.cancelOrder(id, username);
  }
}
