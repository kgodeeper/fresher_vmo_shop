import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import * as Joi from 'joi';
import { JoiPipe } from 'nestjs-joi';
import { User } from '../decorators/user.decorator';
import { Roles } from '../decorators/roles.decorator';
import { RolesGuard } from '../guards/roles.guards';
import { AccountService } from './account.service';
import {
  changePasswordByToken,
  ChangePasswordValidator,
  VerifyValidator,
} from './account.validator';
import { UserInterceptor } from '../interceptors/user.interceptor';
import { Request } from 'express';

@Controller('accounts')
export class UserController {
  constructor(private accountService: AccountService) {}

  @Put('active')
  async activeAccount(@Body() body: VerifyValidator) {
    this.accountService.activeAccount(body);
  }

  @Post('resend-verify-code/:email')
  async resendVerifyCode(
    @Param('email', new JoiPipe(Joi.string().email())) email,
  ) {
    this.accountService.resendVerifyEmail(email);
  }

  @Get('forgot-password/:email')
  async forgotPassword(
    @Param('email', new JoiPipe(Joi.string().email())) email,
  ) {
    this.accountService.forgotPassword(email);
  }

  @Get('confirm-forgot-password/:email/:verifyCode')
  async confirmForgotPassword(
    @Param() param: VerifyValidator,
  ): Promise<object> {
    const presentToken = await this.accountService.confirmForgotPassword(
      param.email,
      param.verifyCode,
    );
    return { presentToken };
  }

  @Put('change-password-by-token')
  async changePasswordByToken(@Body() body: changePasswordByToken) {
    this.accountService.changePasswordByToken(body);
  }

  @Put('change-password')
  @Roles()
  @UseGuards(RolesGuard)
  @UseInterceptors(UserInterceptor)
  async changePassword(
    @Body() body: ChangePasswordValidator,
    @User() user: string,
    @Req() req: Request,
  ) {
    return this.accountService.changePassword(body, user, req);
  }
}
