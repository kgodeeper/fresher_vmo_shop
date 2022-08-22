import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import * as Joi from 'joi';
import { JoiPipe } from 'nestjs-joi';
import { AccountService } from './account.service';
import { changePasswordByToken, VerifyValidator } from './account.validator';

@Controller('accounts')
export class UserController {
  constructor(private accountService: AccountService) {}

  @Put('active')
  async activeAccount(@Body() body: VerifyValidator) {
    await this.accountService.activeAccount(body);
  }

  // post
  @Get('resend-verify-code/:email')
  async resendVerifyCode(
    @Param('email', new JoiPipe(Joi.string().email())) email,
  ) {
    await this.accountService.resendVerifyEmail(email);
  }

  @Get('forgot-password/:email')
  async forgotPassword(
    @Param('email', new JoiPipe(Joi.string().email())) email,
  ) {
    await this.accountService.forgotPassword(email);
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
    await this.accountService.changePasswordByToken(body);
  }
}
