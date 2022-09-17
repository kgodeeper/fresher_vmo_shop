import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { AppHttpException } from '../exceptions/http.exception';
import { GoogleAuthService } from '../modules/google-auths/google-auth.service';

@Injectable()
export class GoogleAuthGuard implements CanActivate {
  constructor(
    @Inject(GoogleAuthService)
    private googleService: GoogleAuthService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = await context.switchToHttp().getRequest();
    const authorization = request.get('Authorization') as string;
    if (!authorization) {
      throw new AppHttpException(HttpStatus.UNAUTHORIZED, 'Unauthorized');
    }
    const isBearer = authorization.includes('Bearer ');
    if (!isBearer) {
      throw new AppHttpException(HttpStatus.BAD_REQUEST, 'Is not bearer token');
    }
    const token = authorization.replace('Bearer ', '');
    try {
      const info = await this.googleService.getInfo(token);
      request.email = info.email;
      return true;
    } catch (error) {
      throw new AppHttpException(HttpStatus.UNAUTHORIZED, error.message);
    }
  }
}
