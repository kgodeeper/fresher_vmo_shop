import { ApiProperty, ApiQuery } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumberString,
  IsString,
  Matches,
} from 'class-validator';
import { AccountStatus, Role } from '../../commons/enum.common';
import * as Regex from '../../utils/regex.util';
import * as Message from '../../commons/string.common';

export class ActiveAccountDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  account: string;

  @ApiProperty()
  @Matches(Regex.VERIFY_CODE_REGEX, {
    message: Message.ValidatorMessage.VERIFY_CODE_NOT_VALID,
  })
  code: string;
}

export class ChangePasswordDto {
  @ApiProperty()
  @Matches(Regex.PASSWORD_REGEX, {
    message: Message.ValidatorMessage.PASSWORD_NOT_VALID,
  })
  oldPassword: string;

  @ApiProperty()
  @Matches(Regex.PASSWORD_REGEX, {
    message: Message.ValidatorMessage.PASSWORD_NOT_VALID,
  })
  newPassword: string;
}

export class ChangeUsernameDto {
  @ApiProperty()
  @Matches(Regex.PASSWORD_REGEX, {
    message: Message.ValidatorMessage.PASSWORD_NOT_VALID,
  })
  password: string;

  @ApiProperty()
  @Matches(Regex.USERNAME_REGEX, {
    message: Message.ValidatorMessage.USERNAME_NOT_VALID,
  })
  username: string;
}

export class ChangeEmailRequireDto {
  @ApiProperty()
  @Matches(Regex.PASSWORD_REGEX, {
    message: Message.ValidatorMessage.PASSWORD_NOT_VALID,
  })
  password: string;

  @ApiProperty()
  @IsEmail()
  newEmail: string;
}

export class ChangeEmailDto {
  @ApiProperty()
  @Matches(Regex.VERIFY_CODE_REGEX, {
    message: Message.ValidatorMessage.VERIFY_CODE_NOT_VALID,
  })
  code: string;
}

export class ForgotPasswordDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @Matches(Regex.PASSWORD_REGEX, {
    message: Message.ValidatorMessage.PASSWORD_NOT_VALID,
  })
  newPassword: string;

  @ApiProperty()
  @Matches(Regex.VERIFY_CODE_REGEX, {
    message: Message.ValidatorMessage.VERIFY_CODE_NOT_VALID,
  })
  code: string;
}

export class ChangeStatusDto {
  @ApiProperty()
  @Matches(Regex.UUID_REGEX, {
    message: Message.ValidatorMessage.UUID_NOT_VALID,
  })
  accountID: string;

  @ApiProperty()
  @IsEnum(AccountStatus, {
    message: Message.ValidatorMessage.ACCOUNT_STATUS_NOT_VALID,
  })
  newStatus: AccountStatus;
}

export class ChangeRoleDto {
  @ApiProperty()
  @Matches(Regex.UUID_REGEX, {
    message: Message.ValidatorMessage.UUID_NOT_VALID,
  })
  accountID: string;

  @ApiProperty()
  @IsEnum(Role, { message: Message.ValidatorMessage.ROLE_NOT_VALID })
  newRole: Role;
}

export class CreateAccountDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsEnum(Role, { message: Message.ValidatorMessage.ROLE_NOT_VALID })
  role: Role;
}

export class ResendCodeDto {
  @ApiProperty()
  @IsNotEmpty()
  account: string;
}
