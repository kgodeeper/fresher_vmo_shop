import { MailerService } from '@nestjs-modules/mailer';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AppHttpException } from '../../exceptions/http.exception';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}
  verify(account: string, destination: string, verifyCode: string): void {
    this.mailerService.sendMail({
      to: destination,
      subject: 'VERIFY YOUR EMAIL',
      template: './verify.template.hbs',
      context: {
        account,
        destination,
        verifyCode,
      },
    });
  }

  changeEmail(account: string, destination: string, verifyCode: string): void {
    this.mailerService.sendMail({
      to: destination,
      subject: 'VERIFY YOUR NEW EMAIL',
      template: './change-email.template.hbs',
      context: {
        account,
        destination,
        verifyCode,
      },
    });
  }

  forgotPassword(destination: string, verifyCode: string): void {
    this.mailerService.sendMail({
      to: destination,
      subject: 'FORGOT PASSWORD REQUIRE',
      template: './forgot-password.template.hbs',
      context: {
        destination,
        verifyCode,
      },
    });
  }

  create(destination: string, username: string, password: string) {
    this.mailerService.sendMail({
      to: destination,
      subject: 'WELCOME NEWBIE',
      template: './create-account.template.hbs',
      context: {
        username,
        password,
      },
    });
  }
}
