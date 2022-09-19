import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GetResourceDto } from '../../commons/dto.common';
import { IPagination } from '../../utils/interface.util';
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
  @UseGuards(AuthGuard)
  async getCustomerCoupon(
    @Query() query: GetResourceDto,
    @UserBound() username: string,
  ): Promise<IPagination<CustomerCoupon>> {
    return this.customerCouponService.getCoupons(
      query.page,
      query.limit,
      query.search,
      query.sort,
      query.filter,
      username,
    );
  }
}
