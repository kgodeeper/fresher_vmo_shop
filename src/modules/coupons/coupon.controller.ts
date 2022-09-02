import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Role } from '../../commons/enum.common';
import { RequireRoles } from '../../decorators/bind-role.decorator';
import { AuthGuard } from '../../guards/auth.guard';
import { RoleGuard } from '../../guards/role.guard';
import { AddCouponDto } from './coupon.dto';
import { CouponService } from './coupon.service';

@Controller('coupons')
@ApiTags('Coupons')
@ApiOkResponse()
@ApiBadRequestResponse()
export class CouponController {
  constructor(private couponService: CouponService) {}
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @ApiBearerAuth()
  @Post()
  @UseGuards(AuthGuard, RoleGuard)
  @RequireRoles(Role.STAFF, Role.SUPERUSER)
  async addCoupon(@Body() body: AddCouponDto): Promise<void> {
    return this.couponService.addCoupon(body);
  }
}
