import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UuidDto } from '../../commons/dto.common';
import { Role } from '../../commons/enum.common';
import { RequireRoles } from '../../decorators/bind-role.decorator';
import { UserBound } from '../../decorators/bind-user.decorator';
import { AuthGuard } from '../../guards/auth.guard';
import { RoleGuard } from '../../guards/role.guard';
import { AddDeliveryDto, UpdateDeliveryDto } from './delivery.dto';
import { Delivery } from './delivery.entity';
import { DeliveryService } from './delivery.service';

@Controller('deliveries')
@ApiTags('Deliveries')
@ApiOkResponse()
@ApiBadRequestResponse()
@ApiUnauthorizedResponse()
@ApiForbiddenResponse()
export class DeliveryController {
  constructor(private deliveryService: DeliveryService) {}

  @ApiBearerAuth()
  @Post()
  @UseGuards(AuthGuard, RoleGuard)
  @RequireRoles(Role.CUSTOMER)
  async addDelivery(
    @Body() body: AddDeliveryDto,
    @UserBound() username: string,
  ): Promise<void> {
    return this.deliveryService.addDeliveryAddress(username, body);
  }

  @ApiBearerAuth()
  @Patch()
  @UseGuards(AuthGuard, RoleGuard)
  @RequireRoles(Role.CUSTOMER)
  async updateDelivery(
    @Body() body: UpdateDeliveryDto,
    @UserBound() username: string,
  ): Promise<void> {
    return this.deliveryService.updateDelivery(body, username);
  }

  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
  })
  @Delete(':id')
  @UseGuards(AuthGuard, RoleGuard)
  @RequireRoles(Role.CUSTOMER)
  async softDeleteDelivery(
    @Param() params: UuidDto,
    @UserBound() username: string,
  ): Promise<void> {
    return this.deliveryService.softDeleteDelivery(params.id, username);
  }

  @ApiBearerAuth()
  @Get('own')
  @UseGuards(AuthGuard, RoleGuard)
  @RequireRoles(Role.CUSTOMER)
  async getOwnDelivery(@UserBound() username: string): Promise<Delivery[]> {
    return this.deliveryService.getOwnDelivery(username);
  }

  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
  })
  @Get(':id')
  @UseGuards(AuthGuard, RoleGuard)
  @RequireRoles(Role.SUPERUSER, Role.STAFF)
  async getDelivery(@Param() params: UuidDto): Promise<Delivery> {
    return this.deliveryService.getDelivery(params.id);
  }
}
