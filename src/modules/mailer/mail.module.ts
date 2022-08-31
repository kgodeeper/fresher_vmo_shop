import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { MailConfig } from '../../configs/mail.config';
import { MailService } from './mail.service';

@Module({
  imports: [
    MailerModule.forRootAsync({
      useClass: MailConfig,
    }),
  ],
  exports: [MailService],
  providers: [MailService],
})
export class MailModule {}
