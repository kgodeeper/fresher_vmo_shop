import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { JWTService } from 'src/modules/jwts/jwt.service';

@Injectable()
export class UserInterceptor implements NestInterceptor {
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
    return next.handle().pipe();
  }
}
