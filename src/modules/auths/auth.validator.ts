import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class LoginValidator {
  @IsNotEmpty()
  @IsString()
  account: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;
}

export class RegisterValidator {
  @IsNotEmpty()
  @IsString()
  @Matches(new RegExp('[a-zA-Z0-9]{6,}$'))
  username: string;

  @IsNotEmpty()
  @IsString()
  @Matches(new RegExp('^(?=.*[a-zA-Z])(?=.*\\d)[a-zA-Z\\d]{8,}$'))
  password: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;
}
