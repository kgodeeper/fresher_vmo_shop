import {
  Body,
  Controller,
  Put,
  UploadedFile,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { accountRole } from 'src/commons/enum.common';
import { HttpExceptionFilter } from 'src/exceptions/http.exception';
import { Roles } from '../guards/roles.decorator';
import { RolesGuard } from '../guards/roles.guards';
import { User } from './customer.decorator';
import { CustomerIntercepter } from './customer.intercepter';
import { CustomerService } from './customer.service';
import { CustomerValidator } from './customer.validator';

@Controller('customers')
export class CustomerController {
  constructor(private customerService: CustomerService) {}
  @Put()
  @Roles(accountRole.CUSTOMER)
  @UseGuards(RolesGuard)
  @UseInterceptors(CustomerIntercepter, FileInterceptor('file'))
  @UseFilters(HttpExceptionFilter)
  async updateCustomerInfo(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: CustomerValidator,
    @User() user: string,
  ): Promise<any> {
    this.customerService.updateCustomerInfo(user, body, file);
  }
}
