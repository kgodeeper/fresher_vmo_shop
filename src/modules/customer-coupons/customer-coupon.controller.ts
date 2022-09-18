import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { IPagination } from 'src/utils/interface.util';
import { Role } from '../../commons/enum.common';
import { RequireRoles } from '../../decorators/bind-role.decorator';
import { UserBound } from '../../decorators/bind-user.decorator';
import { AuthGuard } from '../../guards/auth.guard';
import { RoleGuard } from '../../guards/role.guard';
import { CustomerCoupon } from './customer-coupon.entity';
import { CustomerCouponService } from './customer-coupon.service';

@Controller('customer-coupons')
@ApiTags('Customer coupon')
export class CustomerCouponController {
  constructor(private customerCouponService: CustomerCouponService) {}

  @ApiBearerAuth()
  @Put('save/:code')
  @UseGuards(AuthGuard, RoleGuard)
  @RequireRoles(Role.CUSTOMER)
  async customerSave(
    @Param('code') code: string,
    @UserBound() username: string,
  ): Promise<void> {
    return this.customerCouponService.saveCoupon(code, username);
  }

  @ApiBearerAuth()
  @Get('own')
  @ApiQuery({
    name: 'sort',
    required: false,
  })
  @ApiQuery({
    name: 'search',
    required: false,
  })
  @ApiQuery({
    name: 'filter',
    required: false,
  })
  @ApiQuery({
    name: 'page',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
  })
  @UseGuards(AuthGuard)
  async getCustomerCoupon(
    @Query('page', new ParseIntPipe()) page: number,
    @Query('limit') limit: string,
    @Query('search') search: string,
    @Query('sort') sort: string,
    @Query('filter') filter: string,
    @UserBound() username: string,
  ): Promise<IPagination<CustomerCoupon>> {
    return this.customerCouponService.getCoupons(
      page,
      limit,
      search,
      sort,
      filter,
      username,
    );
  }
}
