import { Body, Controller, Put } from '@nestjs/common';
import { AccountService } from './account.service';
import { VerifyValidator } from './account.validtor';

@Controller('accounts')
export class UserController {
  constructor(private accountService: AccountService) {}

  @Put('active')
  async activeAccount(@Body() body: VerifyValidator) {
    await this.accountService.activeAccount(body);
  }
}
