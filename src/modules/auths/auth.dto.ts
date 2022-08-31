import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';
import * as Regex from '../../utils/regex.util';

export class RegisterDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Matches(Regex.USERNAME_REGEX)
  username: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Matches(Regex.PASSWORD_REGEX)
  password: string;

  @ApiProperty()
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class LoginDto {
  @ApiProperty()
  @IsString()
  account: string;

  @ApiProperty()
  @IsString()
  @Matches(Regex.PASSWORD_REGEX)
  password: string;
}
