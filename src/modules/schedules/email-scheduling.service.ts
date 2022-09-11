import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CustomerService } from '../customers/customer.service';
import { MailService } from '../mailer/mail.service';
import { SaleService } from '../sales/sale.service';

@Injectable()
export default class EmailSchedulingService {
  private delayAfterSend;
  constructor(
    private mailService: MailService,
    private customerService: CustomerService,
    private flashSaleService: SaleService,
  ) {
    this.delayAfterSend = 0;
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  async sendFlashSaleEmail(): Promise<void> {
    if (this.delayAfterSend > 0 && this.delayAfterSend < 7) {
      this.delayAfterSend++;
      return;
    }
    this.delayAfterSend = 0;
    const upcomingSale = await this.flashSaleService.getUpcomingSale();
    if (upcomingSale) {
      console.log(upcomingSale);
      const listRegCustomer = await this.customerService.getSaleEmail();
      listRegCustomer.forEach((item) => {
        this.mailService.flashSale(item.email, item.name, upcomingSale);
      });
      this.delayAfterSend = 1;
    }
  }
}
