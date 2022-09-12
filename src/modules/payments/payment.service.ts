import { HttpStatus, Injectable } from '@nestjs/common';
import { PaymentStatus, ShipmentStatus } from '../../commons/enum.common';
import { DataSource, Repository } from 'typeorm';
import { ServiceUtil } from '../../utils/service.utils';
import { OrderService } from '../orders/order.service';
import { PaypalService } from '../paypals/paypal.service';
import { Payment } from './payment.entity';
import { AppHttpException } from '../../exceptions/http.exception';
import { Order } from '../orders/order.entity';

@Injectable()
export class PaymentService extends ServiceUtil<Payment, Repository<Payment>> {
  constructor(
    private paypalService: PaypalService,
    private orderService: OrderService,
    private dataSource: DataSource,
  ) {
    super(dataSource.getRepository(Payment));
  }
  async getPayoutPath(username: string, id: string) {
    const order = await this.orderService.customerGetDetails(username, id);
    if (order.shipmentStatus !== ShipmentStatus.PREPAIRING) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        `This order was ${order.shipmentStatus}`,
      );
    }
    /**
     * check order pay status, if pending => accept payment
     */
    if (order.fkPayment?.status) {
      if (order.fkPayment.status !== PaymentStatus.PENDING) {
        throw new AppHttpException(
          HttpStatus.BAD_REQUEST,
          `This order was ${order.fkPayment.status}`,
        );
      }
    }
    let payment = order.fkPayment;
    if (!payment) {
      payment = new Payment();
      payment.fkOrder = order;
      payment.ammount = order.finalPrice;
      await this.savePayment(payment);
      order.fkPayment = payment;
      await this.orderService.saveOrder(order);
    }
    try {
      return this.paypalService.getPayoutPath(username, order);
    } catch {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        'Create payout request failure',
      );
    }
  }

  async success(
    orderId: string,
    username: string,
    payId: string,
    payerId: string,
  ): Promise<void> {
    const order = await this.orderService.customerGetDetails(username, orderId);
    await this.paypalService.pay(order, payId, payerId);
    const payment = await this.findPaymentOrder(orderId);
    payment.status = PaymentStatus.PAID;
    payment.payId = payId;
    payment.payerId = payerId;
    await this.savePayment(payment);
    order.paymentStatus = PaymentStatus.PAID;
    await this.orderService.saveOrder(order);
  }

  async findPaymentOrder(orderId: string): Promise<Payment> {
    return this.findOneByCondition({ fkOrder: { pkOrder: orderId } });
  }

  async savePayment(payment: Payment): Promise<void> {
    await this.repository.save(payment);
  }

  async refund(order: Order): Promise<void> {
    await this.paypalService.refund(order);
  }
}
