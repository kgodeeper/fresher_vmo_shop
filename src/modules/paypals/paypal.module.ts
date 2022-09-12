import { DynamicModule, Module } from '@nestjs/common';
import { PaypalService } from './paypal.service';

@Module({})
export class PayPalModule {
  static register(options: {
    mode: 'sanbox';
    client_id: string;
    client_secret: string;
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
    };
  }
}
