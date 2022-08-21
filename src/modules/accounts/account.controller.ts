import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { AccountService } from './account.service';
import { VerifyValidator } from './account.validtor';

@Controller('accounts')
export class UserController {
  constructor(private accountService: AccountService) {}

  @Put('active')
  async activeAccount(@Body() body: VerifyValidator) {
    await this.accountService.activeAccount(body);
  }

  @Get('resend-verify-code/:email')
  async resendVerifyCode(@Param() param) {
    await this.accountService.resendVerifyEmail(param.email);
  }

  @Get('forgot-password/:email')
  async forgotPassword(@Param() param) {
    await this.accountService.forgotPassword(param.email);
  }

  @Get('confirm-forgot-password/:email/:code')
  async confirmForgotPassword(@Param() param) {
    //await this.accountService.confirmForgotPassword(param.email, param.code);
  }
}
