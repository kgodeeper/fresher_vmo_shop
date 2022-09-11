import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { convertDate } from '../../utils/string.util';
import { Sale } from '../sales/sale.entity';

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

  flashSale(destination: string, name: string, flashSale: Sale) {
    const begin = structuredClone(flashSale.begin);
    const end = structuredClone(flashSale.end);
    begin.setHours(begin.getHours() + 7);
    end.setHours(end.getHours() + 7);
    this.mailerService.sendMail({
      to: destination,
      subject: 'FLASHSALE UPCOMMING',
      template: './sale-notify.template.hbs',
      context: {
        name,
        begin: convertDate(begin),
        end: convertDate(end),
      },
    });
  }
}
