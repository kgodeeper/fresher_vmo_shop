import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { IPaginate, IPagination } from 'src/utils/interface.util';
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

  @Get('all/:page')
  async getAllCoupon(
    @Param('page', new ParseIntPipe()) page: number,
  ): Promise<IPaginate<Coupon>> {
    return this.couponService.getAllCoupons(page);
  }

  @Get('current')
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
    required: false,
    name: 'limit',
  })
  async getCurrentCoupon(
    @Query('page', new ParseIntPipe()) page: number,
    @Query('limit') limit: string,
    @Query('search') search: string,
    @Query('sort') sort: string,
    @Query('filter') filter: string,
  ): Promise<IPagination<Coupon>> {
    return this.couponService.getCurrentCoupon(
      page,
      limit,
      search,
      sort,
      filter,
    );
  }
}
