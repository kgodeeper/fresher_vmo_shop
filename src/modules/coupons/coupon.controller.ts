import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { IPaginate } from 'src/utils/interface.util';
import { Role } from '../../commons/enum.common';
import { RequireRoles } from '../../decorators/bind-role.decorator';
import { AuthGuard } from '../../guards/auth.guard';
import { RoleGuard } from '../../guards/role.guard';
import { AddCouponDto } from './coupon.dto';
import { Coupon } from './coupon.entity';
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

  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @ApiBearerAuth()
  @Delete(':id')
  @UseGuards(AuthGuard, RoleGuard)
  @RequireRoles(Role.STAFF, Role.SUPERUSER)
  async removeCoupon(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<void> {
    return this.couponService.removeCoupon(id);
  }

  @Get('all/:page')
  async getAllCoupon(
    @Param('page', new ParseIntPipe()) page: number,
  ): Promise<IPaginate<Coupon>> {
    return this.couponService.getAllCoupons(page);
  }

  @Get('active/:page')
  async getAllActiveCoupon(
    @Param('page', new ParseIntPipe()) page: number,
  ): Promise<IPaginate<Coupon>> {
    return this.couponService.getAllActiveCoupon(page);
  }
}
