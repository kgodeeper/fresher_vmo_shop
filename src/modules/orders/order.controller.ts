import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
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
}
