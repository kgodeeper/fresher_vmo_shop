import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConsumes,
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
  @ApiConsumes('application/x-www-form-urlencoded')
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
  @ApiConsumes('application/x-www-form-urlencoded')
  async updateDelivery(
    @Body() body: UpdateDeliveryDto,
    @UserBound() username: string,
  ): Promise<void> {
    return this.deliveryService.updateDelivery(body, username);
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

  @ApiBearerAuth()
  @Delete(':id')
  @UseGuards(AuthGuard, RoleGuard)
  @RequireRoles(Role.CUSTOMER)
  async deleteDelivery(
    @Param('id', ParseUUIDPipe) id: string,
    @UserBound() username: string,
  ): Promise<void> {
    return this.deliveryService.deleteDelivery(id, username);
  }
}
