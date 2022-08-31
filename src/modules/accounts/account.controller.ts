import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
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
} from './account.dto';
import { AccountService } from './account.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { RoleGuard } from '../../guards/role.guard';
import { IPaginate } from 'src/utils/interface.util';
import { Account } from './account.entity';
import { RequireRoles } from '../../decorators/bind-role.decorator';
import { Role } from '../../commons/enum.common';

@Controller('accounts')
@ApiTags('Accounts')
export class AccountController {
  constructor(private accountService: AccountService) {}
  @ApiOkResponse({
    description: 'Active account success',
  })
  @ApiBadRequestResponse({
    description: 'Active account failure',
  })
  @ApiExtraModels(ActiveAccountDto)
  @Patch('active')
  async activeAccount(@Body() body: ActiveAccountDto): Promise<void> {
    return this.accountService.activeAccount(body);
  }

  @ApiOkResponse({
    description: 'Send ok',
  })
  @ApiBadRequestResponse({
    description: 'Send error, validate error',
  })
  @ApiExtraModels(EmailDto)
  @Post('resend-verify-code')
  async resendVerifyCode(@Body() body: EmailDto): Promise<void> {
    return this.accountService.resendVerifyCode(body);
  }

  @ApiOkResponse({
    description: 'Change username ok',
  })
  @ApiBadRequestResponse({
    description: 'Change username falure',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthornized',
  })
  @ApiExtraModels(ChangeUsernameDto)
  @ApiBearerAuth()
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

  @ApiOkResponse({
    description: 'Change password success',
  })
  @ApiBadRequestResponse({
    description: 'Change password failure, validate error',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthornized',
  })
  @ApiExtraModels(ChangePasswordDto)
  @ApiBearerAuth()
  @Patch('password')
  @UseGuards(AuthGuard)
  async changePassword(
    @Body() body: ChangePasswordDto,
    @UserBound() username: string,
  ): Promise<void> {
    return this.accountService.changePassword(body, username);
  }

  @ApiOkResponse({
    description: 'Change email success',
  })
  @ApiBadRequestResponse({
    description: 'Send verify email success',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthonized',
  })
  @ApiBearerAuth()
  @ApiExtraModels(ChangeEmailRequireDto)
  @Post('change-email-require')
  @UseGuards(AuthGuard)
  async changeEmailRequired(
    @Body() body: ChangeEmailRequireDto,
    @UserBound() username: string,
  ): Promise<void> {
    return this.accountService.changeEmailRequired(body, username);
  }

  @ApiOkResponse({
    description: 'Change email success',
  })
  @ApiBadRequestResponse({
    description: 'Change email failure',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthornized',
  })
  @ApiExtraModels(ChangeEmailDto)
  @ApiBearerAuth()
  @Patch('email')
  @UseGuards(AuthGuard)
  async changeEmail(
    @Body() body: ChangeEmailDto,
    @UserBound() username: string,
  ): Promise<void> {
    return this.accountService.changeEmail(body.email, body.code, username);
  }

  @ApiOkResponse({
    description: 'Send forgot password email success',
  })
  @ApiBadRequestResponse({
    description: 'Send email forgot password fail',
  })
  @ApiExtraModels(EmailDto)
  @Post('forgot-password-required')
  async requireForgotPassword(@Body() body: EmailDto): Promise<void> {
    return this.accountService.requireForgotPassword(body.email);
  }

  @ApiOkResponse({
    description: 'Change password success',
  })
  @ApiBadRequestResponse({
    description: 'Change password failure',
  })
  @ApiExtraModels(ForgotPasswordDto)
  @Patch('forgot-password')
  async forgotPassword(@Body() body: ForgotPasswordDto): Promise<void> {
    return this.accountService.forgotPassword(body);
  }

  @ApiOkResponse({
    description: 'Update avatar success',
  })
  @ApiBadRequestResponse({
    description: 'Update avatar error',
  })
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        avatar: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @Patch('avatar')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('avatar'))
  async updateAvatar(
    @UserBound() username: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<void> {
    return this.accountService.updateAvatar(username, file);
  }

  @ApiOkResponse({
    description: 'Get account success',
  })
  @ApiBadRequestResponse({
    description: 'Get account fail, out of range or empty result',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthornized',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden',
  })
  @ApiParam({
    name: 'page',
    type: 'number',
  })
  @ApiBearerAuth()
  @Get('/alls/:page')
  @RequireRoles(Role.STAFF, Role.SUPERUSER)
  @UseGuards(AuthGuard, RoleGuard)
  async getAllAccounts(
    @Param('page', new ParseIntPipe()) page: number,
  ): Promise<IPaginate<Account>> {
    return this.accountService.getAllAccounts(page);
  }

  @ApiOkResponse({
    description: 'Change status success',
  })
  @ApiBadRequestResponse({
    description: 'Change status failure',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthornized',
  })
  @ApiBearerAuth()
  @ApiExtraModels(ChangeStatusDto)
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
      body.status,
    );
  }

  @ApiOkResponse({
    description: 'Change role success',
  })
  @ApiBadRequestResponse({
    description: 'Change role failure',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthornized',
  })
  @ApiExtraModels(ChangeRoleDto)
  @ApiBearerAuth()
  @Patch('role')
  @UseGuards(AuthGuard, RoleGuard)
  @RequireRoles(Role.SUPERUSER)
  async changeAccountRole(
    @Body() body: ChangeRoleDto,
    @UserBound() username: string,
  ): Promise<void> {
    return this.accountService.changeRole(username, body.accountID, body.role);
  }

  @ApiOkResponse({
    description: 'Create account success',
  })
  @ApiBadRequestResponse({
    description: 'Create account failure, invalidate',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthornized',
  })
  @Post('create')
  @ApiExtraModels(CreateAccountDto)
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RoleGuard)
  @RequireRoles(Role.SUPERUSER)
  async createAccount(@Body() body: CreateAccountDto): Promise<void> {
    return this.accountService.superuserCreateAccount(body.email, body.role);
  }

  @ApiOkResponse({
    description: 'Synchronized success',
  })
  @ApiBadRequestResponse({
    description: 'Synchronized failure',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthornized',
  })
  @ApiBearerAuth()
  @Get('synch')
  @UseGuards(AuthGuard, RoleGuard)
  @RequireRoles(Role.SUPERUSER)
  async synchronizedCache(): Promise<void> {
    return this.accountService.synchronizedCache();
  }

  @ApiOkResponse({
    description: 'Get information success',
  })
  @ApiBadRequestResponse({
    description: 'Bad request',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthornized',
  })
  @ApiBearerAuth()
  @Get('information')
  @UseGuards(AuthGuard)
  async getAccountInformation(@UserBound() username: string): Promise<Account> {
    return this.accountService.getAccountInformation(username);
  }
}
