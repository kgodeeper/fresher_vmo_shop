import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { AppException } from 'src/utils/interface.util';
import { AppHttpException } from './http.exceptions';

@Catch(AppHttpException, HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: AppHttpException | HttpException, host: ArgumentsHost) {
    const response: Response = host.switchToHttp().getResponse<Response>();
    const exceptionResponse: AppException | any = exception.getResponse();
    response.status(exception.getStatus()).json({
      ...exceptionResponse,
      timestamp: new Date().toUTCString(),
    });
  }
}
