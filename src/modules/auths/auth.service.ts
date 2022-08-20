import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { AccountService } from '../accounts/account.service';
import { ConfigService } from '@nestjs/config';
import { RedisCacheService } from '../caches/cache.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private accountService: AccountService,
    private configService: ConfigService,
    private jwtService: JwtService,
    private cacheService: RedisCacheService,
  ) {}
  async validatorUser(account: string, password: string): Promise<object> {
    const user = await this.accountService.validatorAccount(account, password);
    if (user) {
      try {
        const pkUser = user.pkAccount.toString();
        const accessToken = await this.jwtService.signAsync(
          { account },
          { expiresIn: this.configService.get<string>('ACCESSTOKENEXPIRES') },
        );
        let refreshToken = await this.cacheService.get(pkUser);
        if (!refreshToken) {
          refreshToken = await this.jwtService.signAsync(
            { account },
            {
              expiresIn: this.configService.get<string>('REFRESHTOKENEXPIRES'),
            },
          );
          await this.cacheService.set(
            pkUser,
            refreshToken,
            this.configService.get<number>('TTLCACHE'),
          );
        }
        return { accessToken, refreshToken };
      } catch (error) {
        console.log(error);
        throw new InternalServerErrorException();
      }
    } else return {};
  }
}
