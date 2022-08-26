import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Session,
  HttpCode,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { randomNumber } from 'src/utils/string.util';
import { AuthService } from './auth.service';
import * as dto from './auth.dto';

@Controller('auths')
@ApiTags('Auths')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async userLogin(
    @Body() body: dto.LoginDto,
    @Session() session: { sid: string },
  ) {
    session.sid = randomNumber();
    return this.authService.validatorUser(
      body.account,
      body.password,
      session.sid,
    );
  }

  @Post('register')
  @HttpCode(HttpStatus.OK)
  async userRegister(@Body() account: dto.RegisterDto) {
    return this.authService.registerUser(account);
  }

  @Post('token')
  @HttpCode(HttpStatus.OK)
  async newToken(
    @Body()
    body: dto.TokenDto,
    @Session() session: { sid: string },
  ): Promise<object> {
    return this.authService.getNewToken(body.refreshToken, session.sid);
  }
}
