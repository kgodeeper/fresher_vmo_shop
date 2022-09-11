import { Body, Controller, Get, Post, Put, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiExtraModels,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Role } from '../../commons/enum.common';
import { RequireRoles } from '../../decorators/bind-role.decorator';
import { UserBound } from '../../decorators/bind-user.decorator';
import { AuthGuard } from '../../guards/auth.guard';
import { RoleGuard } from '../../guards/role.guard';
import { UpdateCustomerInformationDto } from './customer.dto';
import { Customer } from './customer.entity';
import { CustomerService } from './customer.service';

@Controller('customers')
@ApiTags('Customers')
@ApiOkResponse()
@ApiBadRequestResponse()
export class CustomerController {
  constructor(private customerService: CustomerService) {}

  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @ApiBearerAuth()
  @Put('update')
  @UseGuards(AuthGuard, RoleGuard)
  @RequireRoles(Role.CUSTOMER)
  async updateInformation(
    @UserBound() username: string,
    @Body() body: UpdateCustomerInformationDto,
  ): Promise<void> {
    return this.customerService.updateInformation(username, body);
  }

  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @ApiBearerAuth()
  @Get()
  @UseGuards(AuthGuard, RoleGuard)
  @RequireRoles(Role.CUSTOMER)
  async getInformation(@UserBound() username: string): Promise<Customer> {
    return this.customerService.getInformation(username);
  }

  @ApiUnauthorizedResponse()
  @ApiBadRequestResponse()
  @ApiBearerAuth()
  @Post('register')
  @UseGuards(AuthGuard, RoleGuard)
  @RequireRoles(Role.CUSTOMER)
  async changeRegisterSale(@UserBound() username: string): Promise<void> {
    return this.customerService.changeRegisterSale(username);
  }
}
