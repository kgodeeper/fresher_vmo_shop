import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Session,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiExtraModels,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UserBound } from '../../decorators/bind-user.decorator';
import { AuthGuard } from '../../guards/auth.guard';
import { EmailDto, GetResourceDto } from '../../commons/dto.common';
import {
  ActiveAccountDto,
  ChangeEmailDto,
  ChangeEmailRequireDto,
  ChangePasswordDto,
  ChangeRoleDto,
  StatusDto,
  ChangeUsernameDto,
  CreateAccountDto,
  ForgotPasswordDto,
  ResendCodeDto,
  UpdateAccountDto,
  ForgotPasswordRequireDto,
} from './account.dto';
import { AccountService } from './account.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { RoleGuard } from '../../guards/role.guard';
import { IPagination } from 'src/utils/interface.util';
import { Account } from './account.entity';
import { RequireRoles } from '../../decorators/bind-role.decorator';
import { Role } from '../../commons/enum.common';

@Controller('accounts')
@ApiTags('Accounts')
@ApiOkResponse()
@ApiBadRequestResponse()
export class AccountController {
  constructor(private accountService: AccountService) {}

  @ApiConsumes('application/x-www-form-urlencoded')
  @Patch('active')
  async activeAccount(@Body() body: ActiveAccountDto): Promise<void> {
    return this.accountService.activeAccount(body);
  }

  @ApiBearerAuth()
  @ApiConsumes('application/x-www-form-urlencoded')
  @Patch()
  @UseGuards(AuthGuard)
  async updateAccount(
    @Body() body: UpdateAccountDto,
    @UserBound() username,
    @Session() session,
  ): Promise<void> {
    return this.accountService.updateAccount(body, username);
  }

  @ApiConsumes('application/x-www-form-urlencoded')
  @Post('resend-verify-code')
  async resendVerifyCode(@Body() body: ResendCodeDto): Promise<void> {
    return this.accountService.resendVerifyCode(body);
  }

  @ApiBearerAuth()
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @Patch('username')
  @UseGuards(AuthGuard)
  async changeUsername(
    @Body() body: ChangeUsernameDto,
    @UserBound() username: string,
  ): Promise<void> {
    return this.accountService.changeUsername(
      body.password,
      body.username,
      username,
    );
  }

  @ApiBearerAuth()
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @Patch('password')
  @UseGuards(AuthGuard)
  async changePassword(
    @Body() body: ChangePasswordDto,
    @UserBound() username: string,
  ): Promise<void> {
    return this.accountService.changePassword(body, username);
  }

  @ApiBearerAuth()
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @Post('change-email-require')
  @UseGuards(AuthGuard)
  async changeEmailRequired(
    @Body() body: ChangeEmailRequireDto,
    @UserBound() username: string,
  ): Promise<void> {
    return this.accountService.changeEmailRequired(body, username);
  }

  @ApiBearerAuth()
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @Patch('email')
  @UseGuards(AuthGuard)
  async changeEmail(
    @Body() body: ChangeEmailDto,
    @UserBound() username: string,
  ): Promise<void> {
    return this.accountService.changeEmail(body.code, username);
  }

  @ApiConsumes('application/x-www-form-urlencoded')
  @Post('forgot-password-require')
  async requireForgotPassword(
    @Body() body: ForgotPasswordRequireDto,
  ): Promise<void> {
    return this.accountService.requireForgotPassword(body.account);
  }

  @ApiConsumes('application/x-www-form-urlencoded')
  @Patch('forgot-password')
  async forgotPassword(@Body() body: ForgotPasswordDto): Promise<void> {
    return this.accountService.forgotPassword(body);
  }

  @ApiBearerAuth()
  @ApiBody({
    schema: {
      type: 'object',
      required: ['avatar'],
      properties: {
        avatar: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiConsumes('multipart/form-data')
  @Patch('avatar')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('avatar'))
  async updateAvatar(
    @UserBound() username: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<void> {
    return this.accountService.updateAvatar(username, file);
  }

  @ApiBearerAuth()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @Get('/all')
  // @ApiQuery({ name: 'page', type: 'number', required: false })
  // @ApiQuery({ name: 'limit', type: 'number', required: false })
  // @ApiQuery({ name: 'search', type: 'string', required: false })
  // @ApiQuery({ name: 'sort', type: 'string', required: false })
  // @ApiQuery({ name: 'filter', type: 'string', required: false })
  @RequireRoles(Role.STAFF, Role.SUPERUSER)
  @UseGuards(AuthGuard, RoleGuard)
  async getAllAccounts(
    @Query() query: GetResourceDto,
  ): Promise<IPagination<Account>> {
    return this.accountService.getAllAccounts(
      query.page,
      query.limit,
      query.search,
      query.sort,
      query.filter,
    );
  }

  @ApiBearerAuth()
  @ApiExtraModels(StatusDto)
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @Patch('status')
  @RequireRoles(Role.SUPERUSER)
  @UseGuards(AuthGuard, RoleGuard)
  async changeAccountStatus(
    @Body() body: StatusDto,
    @UserBound() username: string,
  ): Promise<void> {
    return this.accountService.changeStatus(
      username,
      body.accountID,
      body.newStatus,
    );
  }

  @ApiBearerAuth()
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @Patch('role')
  @UseGuards(AuthGuard, RoleGuard)
  @RequireRoles(Role.SUPERUSER)
  async changeAccountRole(
    @Body() body: ChangeRoleDto,
    @UserBound() username: string,
  ): Promise<void> {
    return this.accountService.changeRole(
      username,
      body.accountID,
      body.newRole,
    );
  }

  @ApiBearerAuth()
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @Post('create')
  @UseGuards(AuthGuard, RoleGuard)
  @RequireRoles(Role.SUPERUSER)
  async createAccount(@Body() body: CreateAccountDto): Promise<void> {
    return this.accountService.superuserCreateAccount(body.email, body.role);
  }

  @ApiBearerAuth()
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @Get('information')
  @UseGuards(AuthGuard)
  async getAccountInformation(@UserBound() username: string): Promise<Account> {
    return this.accountService.getAccountInformation(username);
  }

  @ApiBearerAuth()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @Delete(':id')
  @UseGuards(AuthGuard, RoleGuard)
  @RequireRoles(Role.SUPERUSER)
  async deleteAccount(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.accountService.deleteAccount(id);
  }
}
