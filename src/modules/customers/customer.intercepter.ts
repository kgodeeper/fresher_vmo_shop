import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { catchError, Observable, throwError, timeout } from 'rxjs';
import { JWTService } from '../jwts/jwt.service';

@Injectable()
export class CustomerIntercepter implements NestInterceptor {
  constructor(private jwtService: JWTService) {}
  async intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const { username } = await this.jwtService.verifyToken(
      request.get('Authorization').split(' ')[1],
    );
    request.user = username;
    return next.handle().pipe(
      timeout(10000),
      catchError((err) => {
        return throwError(() => err);
      }),
    );
  }
}
