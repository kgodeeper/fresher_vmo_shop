import { Controller, Get } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('auth')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('users')
  getAllUser(): object {
    return this.userService.findAll();
  }
}
