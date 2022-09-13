import { HttpModule, HttpService } from '@nestjs/axios';
import { DynamicModule, Module } from '@nestjs/common';
import { PaypalService } from './paypal.service';

@Module({})
export class PayPalModule {
  static register(options: {
    mode: 'sanbox';
    client_id: string;
    client_secret: string;
    openid_client_id: string;
    openid_client_secret: string;
    openid_redirect_uri: string;
  }): DynamicModule {
    return {
      module: PayPalModule,
      providers: [
        {
          provide: 'PAYPAL_OPTIONS',
          useValue: options,
        },
        PaypalService,
      ],
      exports: [PaypalService],
      imports: [
        HttpModule.register({
          timeout: 5000,
        }),
      ],
    };
  }
}
