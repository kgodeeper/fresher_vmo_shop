import { ConfigService } from '@nestjs/config';

export const paypalConfig = {
  environment: 'sandbox',
  clientId: new ConfigService().get<string>('PAYPAL_CLIENT_ID'),
  clientSecret: new ConfigService().get<string>('PAYPAL_CLIENT_SECRET'),
};
