import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { MailConfig } from 'src/configs/mail.config';
import { MailService } from './mailer.service';

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
