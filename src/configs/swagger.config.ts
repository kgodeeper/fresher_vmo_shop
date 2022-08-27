import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('Shop Manager API docs')
  .setVersion('1.0')
  .addBearerAuth()
  .build();
