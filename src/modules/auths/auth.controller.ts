import { Body, Controller, HttpStatus, Res, Post } from '@nestjs/common';
import { Response } from 'express';
import { UserService } from '../users/user.service';
import { LoginValidator } from './auth.validator';

@Controller('auth')
export class AuthController {
  constructor(private userService: UserService) {}

  @Post('login')
  async userLogin(@Body() body: LoginValidator, @Res() res: Response) {
    if (await this.userService.checkUserExist(body.account, body.password)) {
      res.status(HttpStatus.OK).json({ isLogin: true });
    } else {
      res.status(HttpStatus.BAD_REQUEST).json({ isLogin: false });
    }
  }
}
