import { IsEmail, IsNotEmpty, IsNumberString } from 'class-validator';

export class VerifyValidator {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNumberString()
  @IsNotEmpty()
  verifyCode: string;
}
