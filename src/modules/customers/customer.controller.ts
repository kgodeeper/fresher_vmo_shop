import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
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
export class CustomerController {
  constructor(private customerService: CustomerService) {}
  @ApiOkResponse({
    description: 'Update information success',
  })
  @ApiBadRequestResponse({
    description: 'Update information failure',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthornized',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden',
  })
  @ApiBearerAuth()
  @ApiExtraModels(UpdateCustomerInformationDto)
  @Put('update')
  @UseGuards(AuthGuard, RoleGuard)
  @RequireRoles(Role.CUSTOMER)
  async updateInformation(
    @UserBound() username: string,
    @Body() body: UpdateCustomerInformationDto,
  ): Promise<void> {
    return this.customerService.updateInformation(username, body);
  }

  @ApiOkResponse({
    description: 'Update information success',
  })
  @ApiBadRequestResponse({
    description: 'Update information failure',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthornized',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden',
  })
  @ApiBearerAuth()
  @Get()
  @UseGuards(AuthGuard, RoleGuard)
  @RequireRoles(Role.CUSTOMER)
  async getInformation(@UserBound() username: string): Promise<Customer> {
    return this.customerService.getInformation(username);
  }
}
