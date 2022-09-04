import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiExtraModels,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UserBound } from '../../decorators/bind-user.decorator';
import { Role } from '../../commons/enum.common';
import { RequireRoles } from '../../decorators/bind-role.decorator';
import { AuthGuard } from '../../guards/auth.guard';
import { RoleGuard } from '../../guards/role.guard';
import { OrderService } from './order.service';
import { IPaginate } from 'src/utils/interface.util';
import { Order } from './order.entity';
import { ChangeStatusDto } from './order.dto';

@Controller('orders')
@ApiTags('Orders')
@ApiOkResponse()
@ApiBadRequestResponse()
export class OrderController {
  constructor(private orderService: OrderService) {}
  @ApiBody({
    schema: {
      required: ['products'],
      properties: {
        coupon: {
          type: 'string',
        },
        delivery: {
          type: 'string',
        },
        products: {
          type: 'array',
          items: {
            type: 'object',
            required: ['id', 'quantity'],
            properties: {
              modelId: { type: 'string' },
              quantity: { type: 'number' },
            },
          },
        },
      },
    },
  })
  @ApiForbiddenResponse()
  @ApiUnauthorizedResponse()
  @ApiBearerAuth()
  @Post()
  @UseGuards(AuthGuard, RoleGuard)
  @RequireRoles(Role.CUSTOMER)
  async customerOrder(
    @Body()
    body: {
      delivery: string;
      coupon: string;
      products: { modelId: string; quantity: number }[];
    },
    @UserBound() username: string,
  ): Promise<void> {
    return this.orderService.customerOrder(
      body.coupon,
      body.delivery,
      body.products,
      username,
    );
  }

  @ApiForbiddenResponse()
  @ApiUnauthorizedResponse()
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RoleGuard)
  @RequireRoles(Role.CUSTOMER)
  @Get(':page')
  async customerGetOrder(
    @Param('page', new ParseIntPipe()) page: number,
    @UserBound() username: string,
  ): Promise<IPaginate<Order>> {
    return this.orderService.customerGetOrder(username, page);
  }

  @ApiForbiddenResponse()
  @ApiUnauthorizedResponse()
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RoleGuard)
  @RequireRoles(Role.SUPERUSER, Role.STAFF)
  @Get('alls/:page')
  async getOrders(
    @Param('page', new ParseIntPipe()) page: number,
  ): Promise<IPaginate<Order>> {
    return this.orderService.getOrders(page);
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
  @ApiExtraModels(ChangeStatusDto)
  @UseGuards(AuthGuard, RoleGuard)
  @RequireRoles(Role.STAFF, Role.SUPERUSER)
  @Put('status/:id')
  async changeStatus(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: ChangeStatusDto,
  ): Promise<void> {
    return this.orderService.changeStatus(body.status, id);
  }
}
