import { MailerOptions, MailerOptionsFactory } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';

@Injectable()
export class MailConfig implements MailerOptionsFactory {
  constructor(private configService: ConfigService) {}
  createMailerOptions(): MailerOptions | Promise<MailerOptions> {
    return {
      transport: this.configService.get<string>('MAILERTRANSPORT'),
      template: {
        dir: join(__dirname, '../assets/templates'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    };
  }
}
