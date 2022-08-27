import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  Matches,
} from 'class-validator';
import * as regex from '../../utils/regex.util';
import { accountRole } from 'src/commons/enum.common';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @Matches(regex.VERIFY_CODE_REGEX)
  verifyCode: string;
}

export class ChangePassWithTokenDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  presentToken: string;

  @ApiProperty()
  @IsNotEmpty()
  @Matches(regex.PASSWORD_REGEX)
  password: string;
}

export class ChangePassDto {
  @ApiProperty()
  @IsNotEmpty()
  @Matches(regex.PASSWORD_REGEX)
  oldPassword: string;

  @ApiProperty()
  @IsNotEmpty()
  @Matches(regex.PASSWORD_REGEX)
  newPassword: string;
}

export class AddAccountDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsEnum(accountRole)
  role: accountRole;
}

export class uuidDto {
  @ApiProperty()
  @IsNotEmpty()
  @Matches(regex.UUID_REGEX)
  account: string;
}

export class ChangeRoleDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(accountRole)
  role: accountRole;

  @ApiProperty()
  @IsNotEmpty()
  @Matches(regex.UUID_REGEX)
  account: string;
}
