import {
  Controller,
  Param,
  ParseUUIDPipe,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import { Role } from '../../commons/enum.common';
import { RequireRoles } from '../../decorators/bind-role.decorator';
import { UserBound } from '../../decorators/bind-user.decorator';
import { AuthGuard } from '../../guards/auth.guard';
import { RoleGuard } from '../../guards/role.guard';
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
}
