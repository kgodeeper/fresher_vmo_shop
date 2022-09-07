import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, Matches } from 'class-validator';
import * as Regex from '../../utils/regex.util';
import * as Message from '../../commons/string.common';

export class RegisterDto {
  @ApiProperty()
  @IsNotEmpty()
  @Matches(Regex.USERNAME_REGEX, {
    message: Message.ValidatorMessage.USERNAME_NOT_VALID,
  })
  username: string;

  @ApiProperty()
  @IsNotEmpty()
  @Matches(Regex.PASSWORD_REGEX, {
    message: Message.ValidatorMessage.PASSWORD_NOT_VALID,
  })
  password: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;
}

export class LoginDto {
  @ApiProperty()
  @IsNotEmpty()
  account: string;

  @ApiProperty()
  @IsNotEmpty()
  @Matches(Regex.PASSWORD_REGEX, {
    message: Message.ValidatorMessage.PASSWORD_NOT_VALID,
  })
  password: string;
}

export class getAccessDto {
  @ApiProperty()
  @IsNotEmpty()
  refreshToken: string;
}
