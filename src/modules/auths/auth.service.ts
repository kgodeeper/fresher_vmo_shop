import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../users/user.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private userSerive: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}
  async validatorUser(account: string, password: string): Promise<string> {
    if (await this.userSerive.checkUserExist(account, password)) {
      try {
        return await this.jwtService.signAsync(
          { account },
          { expiresIn: this.configService.get<string>('ACCESSTOKENEXPIRES') },
        );
      } catch {
        throw new InternalServerErrorException();
      }
    } else return '';
  }
}
