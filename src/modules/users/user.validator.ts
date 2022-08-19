import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginValidator {
  @IsNotEmpty()
  @IsString()
  account: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;
}
