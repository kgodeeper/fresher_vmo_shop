import { Body, Controller, Get, HttpStatus, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { UserService } from './user.service';
import { LoginValidator } from './user.validator';

@Controller('auth')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('login')
  async userLogin(@Body() body: LoginValidator, @Res() res: Response) {
    if (await this.userService.checkUserExist(body.account, body.password)) {
      res.status(HttpStatus.OK).json({ isLogin: true });
    } else {
      res.status(HttpStatus.BAD_REQUEST).json({ isLogin: false });
    }
  }

  @Get('users')
  getAllUser(): object {
    return this.userService.findAll();
  }
}
