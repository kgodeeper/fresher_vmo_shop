import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { AccountService } from '../accounts/account.service';
import { ConfigService } from '@nestjs/config';
import { RedisCacheService } from '../caches/cache.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterValidator } from './auth.validator';
import { MailService } from '../mailer/mailer.service';
import { generateCode } from 'src/utils/code-generator.util';

@Injectable()
export class AuthService {
  constructor(
    private accountService: AccountService,
    private configService: ConfigService,
    private jwtService: JwtService,
    private cacheService: RedisCacheService,
    private mailService: MailService,
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
        throw new InternalServerErrorException();
      }
    } else return {};
  }

  async registerUser(account: RegisterValidator): Promise<any> {
    const user = await this.accountService.findUserByAccount(
      account.username,
      account.email,
    );
    if (!user) {
      //await this.accountService.createAccount(account);
      const code = generateCode();
      await this.cacheService.set(
        account.email,
        code,
        this.configService.get<number>('TTLVERIFY'),
      );
      this.mailService.sendVerifyEmail(account.email, code);
    } else {
      throw new HttpException('Account already exist', HttpStatus.BAD_REQUEST);
    }
  }
}
