import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CustomerService } from '../customers/customer.service';
import { MailService } from '../mailer/mail.service';
import { SaleService } from '../sales/sale.service';

@Injectable()
export default class EmailSchedulingService {
  private isSend;
  constructor(
    private mailService: MailService,
    private customerService: CustomerService,
    private flashSaleService: SaleService,
  ) {
    this.isSend = false;
  }

  delay(minutes: number) {
    const endTime = new Date();
    endTime.setMinutes(endTime.getMinutes() + minutes);
    while (new Date() < endTime) {}
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  async sendFlashSaleEmail(): Promise<void> {
    if (this.isSend === true) {
      this.delay(1);
      this.isSend = false;
    }
    const upcomingSale = await this.flashSaleService.getUpcomingSale();
    if (upcomingSale) {
      console.log(upcomingSale);
      const listRegCustomer = await this.customerService.getSaleEmail();
      listRegCustomer.forEach((item) => {
        this.mailService.flashSale(item.email, item.name, upcomingSale);
      });
      this.isSend = true;
    }
  }
}
