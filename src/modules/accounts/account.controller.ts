import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import * as dto from './account.dto';
import { User } from '../decorators/user.decorator';
import { Roles } from '../decorators/roles.decorator';
import { RolesGuard } from '../guards/roles.guards';
import { AccountService } from './account.service';
import { UserInterceptor } from '../interceptors/user.interceptor';
import { Request } from 'express';
import { accountRole } from 'src/commons/enum.common';
import { Account } from './account.entity';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import { EmailDto } from 'src/utils/dto.util';
import { Paginate } from 'src/utils/interface.util';

@Controller('accounts')
@ApiTags('Accounts')
export class UserController {
  constructor(private accountService: AccountService) {}

  @Put('active')
  async activeAccount(@Body() body: dto.VerifyDto) {
    return this.accountService.activeAccount(body);
  }

  @Post('resend-verify-code/:email')
  @ApiParam({ name: 'email' })
  async resendVerifyCode(@Param() params: EmailDto) {
    return this.accountService.resendVerifyEmail(params.email);
  }

  @Get('forgot-password/:email')
  @ApiParam({ name: 'email' })
  async forgotPassword(@Param() params: EmailDto) {
    return this.accountService.forgotPassword(params.email);
  }

  @Get('confirm-forgot-password/:email/:verifyCode')
  @ApiParam({
    name: 'confirm information',
    type: Object,
  })
  async confirmForgotPassword(@Param() param: dto.VerifyDto): Promise<object> {
    return this.accountService.confirmForgotPassword(
      param.email,
      param.verifyCode,
    );
  }

  @Put('change-password-by-token')
  async changePasswordByToken(@Body() body: dto.ChangePassWithTokenDto) {
    return this.accountService.changePasswordByToken(body);
  }

  @Put('change-password')
  @Roles()
  @UseGuards(RolesGuard)
  @ApiBearerAuth()
  @UseInterceptors(UserInterceptor)
  async changePassword(
    @Body() body: dto.ChangePassDto,
    @User() user: string,
    @Req() req: Request,
  ) {
    return this.accountService.changePassword(body, user, req);
  }

  @Get(':page')
  @Roles(accountRole.SUPERUSER)
  @UseGuards(RolesGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'page' })
  async getAccount(
    @Param('page', ParseIntPipe) page: number,
  ): Promise<Paginate<Account>> {
    return this.accountService.getAll(page);
  }

  @Put('block')
  @Roles(accountRole.SUPERUSER)
  @UseGuards(RolesGuard)
  @UseInterceptors(UserInterceptor)
  @ApiBearerAuth()
  async blockAccount(
    @Body() body: dto.uuidDto,
    @User() user: string,
  ): Promise<any> {
    return this.accountService.blockAccount(body.account, user);
  }

  @Put('open')
  @Roles(accountRole.SUPERUSER)
  @UseGuards(RolesGuard)
  @ApiBearerAuth()
  async openAccount(@Body() body: dto.uuidDto): Promise<any> {
    return this.accountService.openAccount(body.account);
  }

  @Post()
  @Roles(accountRole.SUPERUSER)
  @UseGuards(RolesGuard)
  @ApiBearerAuth()
  async addAccount(@Body() body: dto.AddAccountDto) {
    return this.accountService.addAccount(body);
  }

  @Put('change-role')
  @Roles(accountRole.SUPERUSER)
  @UseGuards(RolesGuard)
  @UseInterceptors(UserInterceptor)
  async changeRole(@Body() body: dto.ChangeRoleDto, @User() user) {
    return this.accountService.changeRole(
      body.account,
      body.role as accountRole,
      user,
    );
  }
}
