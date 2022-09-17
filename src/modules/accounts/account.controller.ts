import {
  Body,
  Controller,
  Get,
  ParseIntPipe,
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
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UserBound } from '../../decorators/bind-user.decorator';
import { AuthGuard } from '../../guards/auth.guard';
import { EmailDto } from '../../commons/dto.common';
import {
  ActiveAccountDto,
  ChangeEmailDto,
  ChangeEmailRequireDto,
  ChangePasswordDto,
  ChangeRoleDto,
  ChangeStatusDto,
  ChangeUsernameDto,
  CreateAccountDto,
  ForgotPasswordDto,
  ResendCodeDto,
  UpdateAccountDto,
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

  @Patch('active')
  async activeAccount(@Body() body: ActiveAccountDto): Promise<void> {
    return this.accountService.activeAccount(body);
  }

  @ApiBearerAuth()
  @Patch()
  @UseGuards(AuthGuard)
  async updateAccount(
    @Body() body: UpdateAccountDto,
    @UserBound() username,
    @Session() session,
  ): Promise<void> {
    return this.accountService.updateAccount(body, username);
  }

  @Post('resend-verify-code')
  async resendVerifyCode(@Body() body: ResendCodeDto): Promise<void> {
    return this.accountService.resendVerifyCode(body);
  }

  @ApiBearerAuth()
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

  @Post('forgot-password-require')
  async requireForgotPassword(@Body() body: EmailDto): Promise<void> {
    return this.accountService.requireForgotPassword(body.email);
  }

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
  @ApiQuery({ name: 'page', type: 'number' })
  @ApiQuery({ name: 'limit', type: 'number' })
  @ApiQuery({ name: 'search', type: 'string' })
  @ApiQuery({ name: 'sort', type: 'string' })
  @ApiQuery({ name: 'filter', type: 'string' })
  @RequireRoles(Role.STAFF, Role.SUPERUSER)
  @UseGuards(AuthGuard, RoleGuard)
  async getAllAccounts(
    @Query('page', ParseIntPipe) page: number,
    @Query('limit') limit: string,
    @Query('sort') sort: string,
    @Query('search') search: string,
    @Query('filter') filter: string,
  ): Promise<IPagination<Account>> {
    return this.accountService.getAllAccounts(
      page,
      Number(limit),
      search,
      sort,
      filter,
    );
  }

  @ApiBearerAuth()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @Patch('status')
  @RequireRoles(Role.SUPERUSER)
  @UseGuards(AuthGuard, RoleGuard)
  async changeAccountStatus(
    @Body() body: ChangeStatusDto,
    @UserBound() username: string,
  ): Promise<void> {
    return this.accountService.changeStatus(
      username,
      body.accountID,
      body.newStatus,
    );
  }

  @ApiBearerAuth()
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
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @Post('create')
  @UseGuards(AuthGuard, RoleGuard)
  @RequireRoles(Role.SUPERUSER)
  async createAccount(@Body() body: CreateAccountDto): Promise<void> {
    return this.accountService.superuserCreateAccount(body.email, body.role);
  }

  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @ApiBearerAuth()
  @Get('information')
  @UseGuards(AuthGuard)
  async getAccountInformation(@UserBound() username: string): Promise<Account> {
    return this.accountService.getAccountInformation(username);
  }
}
