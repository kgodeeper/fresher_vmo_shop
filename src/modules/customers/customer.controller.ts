import {
  Body,
  Controller,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { accountRole } from 'src/commons/enum.common';
import { Roles } from '../decorators/roles.decorator';
import { RolesGuard } from '../guards/roles.guards';
import { User } from '../decorators/user.decorator';
import { UserInterceptor } from '../interceptors/user.interceptor';
import { CustomerService } from './customer.service';
import { CustomerValidator } from './customer.validator';
import { ApiTags } from '@nestjs/swagger';

@Controller('customers')
@ApiTags('Customers')
export class CustomerController {
  constructor(private customerService: CustomerService) {}
  @Put()
  @Roles(accountRole.CUSTOMER)
  @UseGuards(RolesGuard)
  @UseInterceptors(UserInterceptor, FileInterceptor('file'))
  async updateCustomerInfo(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: CustomerValidator,
    @User() user: string,
  ): Promise<any> {
    return this.customerService.updateCustomerInfo(user, body, file);
  }
}
