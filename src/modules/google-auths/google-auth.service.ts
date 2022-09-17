import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { throws } from 'assert';
import { google, Auth } from 'googleapis';

@Injectable()
export class GoogleAuthService {
  oauthClient: Auth.OAuth2Client;
  constructor(private configService: ConfigService) {
    this.oauthClient = new google.auth.OAuth2({
      clientId: this.configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: this.configService.get<string>('GOOGLE_CLIENT_SECRET'),
    });
  }

  async getInfo(token: string) {
    const tokenInfo = await this.oauthClient.getTokenInfo(token);
    return tokenInfo;
  }
}
