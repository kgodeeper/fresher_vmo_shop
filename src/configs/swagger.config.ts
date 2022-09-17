import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .addBearerAuth()
  .addServer('http://localhost:8888')
  .setTitle('Fresher VMO Project')
  .setVersion('1.0.0')
  .build();
