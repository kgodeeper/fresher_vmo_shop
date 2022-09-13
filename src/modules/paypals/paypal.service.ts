import { HttpService } from '@nestjs/axios';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { rejects } from 'assert';
import { resolve } from 'path';
import * as paypal from 'paypal-rest-sdk';
import { PaymentUrl } from '../../commons/string.common';
import { AppHttpException } from '../../exceptions/http.exception';
import { Order } from '../orders/order.entity';

@Injectable()
export class PaypalService {
  constructor(
    @Inject('PAYPAL_OPTIONS') private options,
    private httpService: HttpService,
  ) {
    paypal.configure(options);
  }

  getPaypal() {
    return paypal;
  }

  async getPayoutPath(username: string, order: Order) {
    const return_url = `${PaymentUrl.return_url}/${username}/${order.pkOrder}`;
    const cancel_url = PaymentUrl.cancel_url;
    const payoutJson = {
      intent: 'sale',
      payer: {
        payment_method: 'paypal',
      },
      redirect_urls: {
        return_url,
        cancel_url,
      },
      transactions: [
        {
          amount: {
            currency: 'USD',
            total: order.finalPrice,
          },
        },
      ],
    };
    return new Promise((resolve, reject) => {
      paypal.payment.create(payoutJson, async (error, payout) => {
        if (error) {
          reject(
            new AppHttpException(
              HttpStatus.BAD_REQUEST,
              `Cant not create payout request`,
            ),
          );
        } else {
          const link = payout.links.filter((item) => {
            return item.rel === 'approval_url';
          });
          resolve(link[0].href);
        }
      });
    });
  }

  async pay(order: Order, paymentId: string, payerId: string): Promise<string> {
    const executeJson = {
      payer_id: payerId,
      transactions: [
        {
          amount: {
            currency: 'USD',
            total: order.finalPrice,
          },
        },
      ],
    };
    return new Promise((resolve, reject) => {
      paypal.payment.execute(paymentId, executeJson, async (error, payment) => {
        if (error) {
          reject(
            new AppHttpException(
              HttpStatus.BAD_REQUEST,
              'Payment failure, please try again',
            ),
          );
        } else {
          const links = payment.transactions[0].related_resources[0].sale.links;
          const refund = links.filter((item) => {
            return item.rel === 'refund';
          });
          resolve(refund[0].href);
        }
      });
    });
  }

  async refund(order: Order): Promise<void> {
    return new Promise((resolve, reject) => {
      paypal.capture.refund(
        order.fkPayment.refundPath.split('/').at(-2),
        {},
        (error, result) => {
          if (error) {
            reject(
              new AppHttpException(
                HttpStatus.BAD_REQUEST,
                `Refund error ! expires time`,
              ),
            );
          } else {
            resolve();
          }
        },
      );
    });
  }
}
