import { ConfigService } from '@nestjs/config';
import { NestSessionOptions } from 'nestjs-session';

export async function sessionConfig(): Promise<NestSessionOptions> {
  return {
    session: {
      secret: new ConfigService().get<string>('SECRETSTR'),
      resave: false,
      saveUninitialized: false,
    },
  };
}
