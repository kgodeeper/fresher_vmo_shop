import { HttpException, HttpStatus } from '@nestjs/common';
import { IHttpException } from '../utils/interface.util';
import { HttpError } from '../commons/const.common';

export class AppHttpException extends HttpException {
  exceptionResponse: IHttpException;
  statusCode: HttpStatus | number;

  constructor(status: HttpStatus, message: string) {
    super({ status, message }, status);
    this.statusCode = status;
    this.exceptionResponse = {
      statusCode: status,
      message,
      error: HttpError[this.statusCode],
    } as IHttpException;
  }
  getResponse(): IHttpException {
    return this.exceptionResponse;
  }
  getStatus(): HttpStatus | number {
    return this.statusCode;
  }
}
