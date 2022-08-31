import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiExtraModels,
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

@Controller('Deliveries')
@ApiTags('Deliveries')
export class DeliveryController {
  constructor(private deliveryService: DeliveryService) {}
  @ApiOkResponse({
    description: 'Add delivery address success',
  })
  @ApiBadRequestResponse({
    description: 'Add delivery address failure',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthornized',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden',
  })
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

  @ApiOkResponse({
    description: 'Update delivery address success',
  })
  @ApiBadRequestResponse({
    description: 'Update delivery address failure',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthonized',
  })
  @ApiBadRequestResponse({
    description: 'Bad Request',
  })
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

  @ApiOkResponse({
    description: 'Remove delivery address success',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden',
  })
  @ApiBadRequestResponse({
    description: 'Remove delivery address failure',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthornized',
  })
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

  @ApiOkResponse({
    description: 'Get delivery address success',
  })
  @ApiBadRequestResponse({
    description: 'Get delivery address failure',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthornized',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden',
  })
  @ApiBearerAuth()
  @Get('own')
  @UseGuards(AuthGuard, RoleGuard)
  @RequireRoles(Role.CUSTOMER)
  async getOwnDelivery(@UserBound() username: string): Promise<Delivery[]> {
    return this.deliveryService.getOwnDelivery(username);
  }

  @ApiOkResponse({
    description: 'Get delivery address success',
  })
  @ApiBadRequestResponse({
    description: 'Get delivery address failure',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthornized',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden',
  })
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
