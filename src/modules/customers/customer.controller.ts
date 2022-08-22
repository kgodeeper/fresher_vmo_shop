import { Body, Controller, Put, UseGuards } from '@nestjs/common';
import { accountRole } from 'src/commons/enum.common';
import { Roles } from '../guards/roles.decorator';
import { RolesGuard } from '../guards/roles.guards';
import { CustomerService } from './customer.service';
import { CustomerValidator } from './customer.validator';

@Controller('customers')
export class CustomerController {
  constructor(private customerService: CustomerService) {}
  @Put()
  @Roles(accountRole.CUSTOMER)
  @UseGuards(RolesGuard)
  async updateCustomerInfo(@Body() body: CustomerValidator): Promise<any> {
    this.customerService.updateCustomerInfo(body);
  }
}
