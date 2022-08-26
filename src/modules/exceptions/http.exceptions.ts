import { HttpException, HttpStatus } from '@nestjs/common';
import { AppException } from 'src/utils/interface.util';
import { HttpError } from 'src/utils/const.util';

export class AppHttpException extends HttpException {
  exceptionResponse: AppException;
  statusCode: HttpStatus | number;

  constructor(status: HttpStatus, message: string) {
    super({ status, message }, status);
    this.statusCode = status;
    this.exceptionResponse = {
      status,
      message,
      error: HttpError[this.statusCode],
    } as AppException;
  }
  getResponse(): AppException {
    return this.exceptionResponse;
  }
  getStatus(): HttpStatus | number {
    return this.statusCode;
  }
}
