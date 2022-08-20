import { Body, Controller, HttpStatus, Res, Post } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginValidator, RegisterValidator } from './auth.validator';

@Controller('auths')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async userLogin(@Body() body: LoginValidator, @Res() res: Response) {
    const token = await this.authService.validatorUser(
      body.account,
      body.password,
    );
    res.status(HttpStatus.OK).json(token);
  }

  @Post('register')
  async userRegister(@Body() account: RegisterValidator) {
    return await this.authService.registerUser(account);
  }
}
