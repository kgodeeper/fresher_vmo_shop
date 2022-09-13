import { forwardRef, Module } from '@nestjs/common';
import { OrderModule } from '../orders/order.module';
import { PayPalModule } from '../paypals/paypal.module';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';

@Module({
  imports: [
    PayPalModule.register({
      mode: 'sandbox' as 'sanbox',
      client_id:
        'AYrupVPRP6kYJZwfq1ll8hFD7Lz1vB7bra3Nqlhho6kWOI9P4W_UCrqubpO1xOpoJUHNIg0U1ljsoI_R',
      client_secret:
        'ENGnVeIAv_LK3DjG6X4RcJx877spAASGlNt2-jfvXjkPqZYWbBUF_3cagk_GXQzxAvFL88x9V4EZik0d',
      openid_client_id:
        'AYrupVPRP6kYJZwfq1ll8hFD7Lz1vB7bra3Nqlhho6kWOI9P4W_UCrqubpO1xOpoJUHNIg0U1ljsoI_R',
      openid_client_secret:
        'ENGnVeIAv_LK3DjG6X4RcJx877spAASGlNt2-jfvXjkPqZYWbBUF_3cagk_GXQzxAvFL88x9V4EZik0d',
      openid_redirect_uri: 'http://localhost:8888',
    }),
    forwardRef(() => OrderModule),
  ],
  exports: [PaymentService],
  providers: [PaymentService],
  controllers: [PaymentController],
})
export class PaymentModule {}
