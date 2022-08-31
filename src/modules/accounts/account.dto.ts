import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  Matches,
} from 'class-validator';
import { AccountStatus, Role } from '../../commons/enum.common';
import * as Regex from '../../utils/regex.util';

export class ActiveAccountDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @Matches(Regex.VERIFY_CODE_REGEX)
  code: string;
}

export class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Matches(Regex.PASSWORD_REGEX)
  oldPassword: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Matches(Regex.PASSWORD_REGEX)
  newPassword: string;
}

export class ChangeUsernameDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Matches(Regex.PASSWORD_REGEX)
  password: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Matches(Regex.USERNAME_REGEX)
  username: string;
}

export class ChangeEmailRequireDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Matches(Regex.PASSWORD_REGEX)
  password: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;
}

export class ChangeEmailDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Matches(Regex.VERIFY_CODE_REGEX)
  code: string;
}

export class ForgotPasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Matches(Regex.PASSWORD_REGEX)
  password: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Matches(Regex.VERIFY_CODE_REGEX)
  code: string;
}

export class ChangeStatusDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Matches(Regex.UUID_REGEX)
  accountID: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(AccountStatus)
  status: AccountStatus;
}

export class ChangeRoleDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Matches(Regex.UUID_REGEX)
  accountID: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(Role)
  role: Role;
}

export class CreateAccountDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(Role)
  role: Role;
}
