import {
  All,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '../../commons/enum.common';
import { RequireRoles } from '../../decorators/bind-role.decorator';
import { UserBound } from '../../decorators/bind-user.decorator';
import { AuthGuard } from '../../guards/auth.guard';
import { RoleGuard } from '../../guards/role.guard';
import { PaymentService } from './payment.service';

@Controller('payments')
@ApiTags('Payments')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}
  @ApiBearerAuth()
  @Get(':id')
  @UseGuards(AuthGuard, RoleGuard)
  @RequireRoles(Role.CUSTOMER)
  async getPayment(
    @Param('id', new ParseUUIDPipe()) id: string,
    @UserBound() username: string,
  ) {
    return this.paymentService.getPayoutPath(username, id);
  }

  @Get('paid/:username/:id')
  async paid(
    @Query() query,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('username') username: string,
  ): Promise<void> {
    return this.paymentService.success(
      id,
      username,
      query.paymentId,
      query.PayerID,
    );
  }
}
