import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .addBearerAuth()
  .addServer('http://localhost:8888')
  .setContact(
    'kdev:DucKhanh',
    'https://facebook.com/duckhanh4444',
    'khanhbd@vmodev.com',
  )
  .setTitle('Laptop shop')
  .setVersion('1.0.0')
  .build();
