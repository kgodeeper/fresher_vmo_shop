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
  @ApiQuery({
    name: 'sort',
    required: false,
  })
  @ApiQuery({
    name: 'search',
    required: false,
  })
  @ApiQuery({
    name: 'filter',
    required: false,
  })
  @ApiQuery({
    name: 'page',
  })
  @ApiQuery({
    required: false,
    name: 'limit',
  })
  @ApiQuery({
    name: 'range',
    required: false,
  })
  async getOwnOrders(
    @Query('page', new ParseIntPipe()) page: number,
    @Query('limit') limit: string,
    @Query('search') search: string,
    @Query('sort') sort: string,
    @Query('filter') filter: string,
    @Query('range') range: string,
    @UserBound() username: string,
  ): Promise<IPagination<Order>> {
    return this.orderService.getOwnOrders(
      page,
      limit,
      search,
      sort,
      filter,
      range,
      username,
    );
  }

  @Get('all')
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RoleGuard)
  @RequireRoles(Role.STAFF, Role.SUPERUSER)
  @ApiQuery({
    name: 'sort',
    required: false,
  })
  @ApiQuery({
    name: 'search',
    required: false,
  })
  @ApiQuery({
    name: 'filter',
    required: false,
  })
  @ApiQuery({
    name: 'page',
  })
  @ApiQuery({
    required: false,
    name: 'limit',
  })
  @ApiQuery({
    name: 'range',
    required: false,
  })
  async getAllOrders(
    @Query('page', new ParseIntPipe()) page: number,
    @Query('limit') limit: string,
    @Query('search') search: string,
    @Query('sort') sort: string,
    @Query('filter') filter: string,
    @Query('range') range: string,
    @UserBound() username: string,
  ): Promise<IPagination<Order>> {
    return this.orderService.getAllOrders(
      page,
      limit,
      search,
      sort,
      filter,
      range,
      username,
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
