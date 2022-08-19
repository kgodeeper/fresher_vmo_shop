import { Injectable } from '@nestjs/common';
import { UserService } from '../users/user.service';

@Injectable()
export class AuthService {
  constructor(private userSerive: UserService) {}
  async validatorUser(account: string, password: string): Promise<boolean> {
    return await this.userSerive.checkUserExist(account, password);
  }
}
