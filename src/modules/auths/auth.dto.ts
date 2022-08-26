import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';
import * as regex from 'src/utils/regex.util';

export class LoginDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  account: string;

  @ApiProperty()
  @IsNotEmpty()
  @Matches(regex.PASSWORD_REGEX)
  password: string;
}

export class RegisterDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Matches(regex.USERNAME_REGEX)
  username: string;

  @ApiProperty()
  @IsNotEmpty()
  @Matches(regex.PASSWORD_REGEX)
  password: string;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class TokenDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
