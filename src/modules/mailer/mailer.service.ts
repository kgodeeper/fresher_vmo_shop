import { MailerService } from '@nestjs-modules/mailer';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}
  sendVerifyEmail(destination: string, verifyCode: string): void {
    try {
      this.mailerService.sendMail({
        to: destination,
        subject: 'VERIFY YOUR EMAIL',
        template: './mail.template.hbs',
        context: {
          verifyCode,
        },
      });
    } catch {
      throw new HttpException(
        'Send mail error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  sendForgotPasswordCode(destination: string, verifyCode: string): void {
    try {
      this.mailerService.sendMail({
        to: destination,
        subject: 'FORGOT PASSWORD REQUIRE',
        template: './pass.template.hbs',
        context: {
          verifyCode,
        },
      });
    } catch {
      throw new HttpException(
        'Send mail error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
