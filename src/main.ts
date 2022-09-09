import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { swaggerConfig } from './configs/swagger.config';
import { HttpExceptionFilter } from './exceptions/http.exeption-filter';
import { HandleResponseInterceptor } from './interceptors/handle-response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new HandleResponseInterceptor());
  app.useGlobalPipes(new ValidationPipe());
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);
  await app.listen(8888);
}
bootstrap();
