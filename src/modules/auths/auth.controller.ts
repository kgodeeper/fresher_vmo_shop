import {
  Body,
  Controller,
  HttpStatus,
  Res,
  Post,
  Session,
  HttpCode,
} from '@nestjs/common';
import { Response } from 'express';
import { randomNumber } from 'src/utils/string.util';
import { AuthService } from './auth.service';
import { LoginValidator, RegisterValidator } from './auth.validator';

@Controller('auths')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async userLogin(
    @Body() body: LoginValidator,
    @Res() res: Response,
    @Session() session: { sid: string },
  ) {
    session.sid = randomNumber();
    const token = await this.authService.validatorUser(
      body.account,
      body.password,
      session.sid,
    );
    res.status(HttpStatus.OK).json(token);
  }

  @Post('register')
  async userRegister(@Body() account: RegisterValidator) {
    return this.authService.registerUser(account);
  }

  @Post('new-token')
  @HttpCode(HttpStatus.OK)
  async newToken(
    @Body()
    body: { token: string },
    @Session() session: { sid: string },
  ): Promise<object> {
    return this.authService.newToken(body.token, session.sid);
  }
}
