import { Controller } from '@nestjs/common';
import { AccountService } from './account.service';

@Controller('account')
export class UserController {
  constructor(private account: AccountService) {}
}
