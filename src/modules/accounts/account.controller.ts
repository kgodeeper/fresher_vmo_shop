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
  AddAccountValidator,
  changePasswordByToken,
  ChangePasswordValidator,
  ChangeRoleValidator,
  PKAccountValidator,
  VerifyValidator,
} from './account.validator';
import { UserInterceptor } from '../interceptors/user.interceptor';
import { Request } from 'express';
import { accountRole } from 'src/commons/enum.common';
import { Account } from './account.entity';

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

  @Get('')
  @Roles(accountRole.SUPERUSER)
  @UseGuards(RolesGuard)
  async getAccount(): Promise<Account[]> {
    return this.accountService.getAll();
  }

  @Put('block')
  @Roles(accountRole.SUPERUSER)
  @UseGuards(RolesGuard)
  @UseInterceptors(UserInterceptor)
  async blockAccount(
    @Body() body: PKAccountValidator,
    @User() user: string,
  ): Promise<any> {
    return this.accountService.blockAccount(body.account, user);
  }

  @Put('open')
  @Roles(accountRole.SUPERUSER)
  @UseGuards(RolesGuard)
  async openAccount(@Body() body: PKAccountValidator): Promise<any> {
    return this.accountService.openAccount(body.account);
  }

  @Post()
  @Roles(accountRole.SUPERUSER)
  @UseGuards(RolesGuard)
  async addAccount(@Body() body: AddAccountValidator) {
    return this.accountService.addAccount(body);
  }

  @Put('change-role')
  @Roles(accountRole.SUPERUSER)
  @UseGuards(RolesGuard)
  @UseInterceptors(UserInterceptor)
  async changeRole(@Body() body: ChangeRoleValidator, @User() user) {
    return this.accountService.changeRole(
      body.account,
      body.role as accountRole,
      user,
    );
  }
}
