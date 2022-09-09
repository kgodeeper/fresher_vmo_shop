import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { IHttpException } from '../utils/interface.util';
import { AppHttpException } from './http.exception';

@Catch(AppHttpException, HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: AppHttpException | HttpException, host: ArgumentsHost) {
    const response: Response = host.switchToHttp().getResponse<Response>();
    const exceptionResponse: IHttpException | any = exception.getResponse();
    const current = new Date();
    current.setHours(current.getHours() + 7);
    response.status(exception.getStatus()).json({
      ...exceptionResponse,
      timestamp: current.toUTCString(),
    });
  }
}
