import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { accountRole } from 'src/commons/enum.common';
import { Roles } from '../decorators/roles.decorator';
import { User } from '../decorators/user.decorator';
import { RolesGuard } from '../guards/roles.guards';
import { UserInterceptor } from '../interceptors/user.interceptor';
import { DeliveryService } from './delivery.service';
import {
  DeliveryValidator,
  UpdateDeliveryValidator,
} from './delivery.validator';

@Controller('deliveries')
export class DeliveryController {
  constructor(private deliveryService: DeliveryService) {}
  @Post()
  @UseGuards(RolesGuard)
  @Roles(accountRole.CUSTOMER)
  @UseInterceptors(UserInterceptor)
  async addDelivery(@Body() body: DeliveryValidator, @User() user) {
    return this.deliveryService.addDelivery(user, body);
  }

  @Patch()
  @UseGuards(RolesGuard)
  @Roles(accountRole.CUSTOMER)
  async updateDelivery(@Body() body: UpdateDeliveryValidator) {
    return this.deliveryService.updateDeliveryAddress(body);
  }

  @Get()
  @UseGuards(RolesGuard)
  @UseInterceptors(UserInterceptor)
  @Roles(accountRole.CUSTOMER)
  async getDeliveries(@User() user) {
    return this.deliveryService.getDeliveryAddress(user);
  }

  @Delete(':deliveryId')
  @UseGuards(RolesGuard)
  @Roles(accountRole.CUSTOMER)
  async deleteDelivery(@Param() params) {
    return this.deliveryService.deleteDelivery(params.deliveryId);
  }
}
