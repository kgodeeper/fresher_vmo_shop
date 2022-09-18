import {
  CallHandler,
  ExecutionContext,
  HttpStatus,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';

export class HandleResponseInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    /**
     * change 201 status to 200
     * delete password field if it contains in response data
     */
    const response = context.switchToHttp().getResponse();
    if (response.statusCode === HttpStatus.CREATED)
      response.statusCode = HttpStatus.OK;
    return next.handle().pipe(
      map((data) => {
        if (data?.password) {
          delete data.password;
        }
        return data;
      }),
    );
  }
}
