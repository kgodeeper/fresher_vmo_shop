import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { splitString } from '../utils/string.util';
import { AppHttpException } from '../exceptions/http.exception';
import { RedisCacheService } from '../modules/caches/cache.service';
import { AppJwtService } from '../modules/jwts/jwt.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject(AppJwtService)
    private jwtService: AppJwtService,
    private cacheService: RedisCacheService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authorization = request.get('Authorization');
    /**
     * check have authorization header?
     */
    if (!authorization) {
      throw new AppHttpException(HttpStatus.UNAUTHORIZED, 'Unauthornized');
    }

    /**
     * check is bearer auth ?
     */
    const tokenParts = authorization.split(' ');
    if (tokenParts[0] !== 'Bearer') {
      throw new AppHttpException(HttpStatus.UNAUTHORIZED, 'Not Bearer Auth');
    }

    /**
     * verify token and check session to make sure that one device can use only one accessToken
     */
    try {
      const { username } = await this.jwtService.verifyToken(tokenParts[1]);
      const cachedToken = await this.cacheService.get(
        `user:${username}:accessToken:${request.session.sessionId}`,
      );
      if (cachedToken !== splitString(tokenParts[1], '.', -1)) {
        throw new AppHttpException(
          HttpStatus.BAD_REQUEST,
          'Session is invalid',
        );
      }
      /**
       * next, pass username to request
       */
      request.user = username;
    } catch (error) {
      if (error instanceof AppHttpException) throw error;
      throw new AppHttpException(HttpStatus.UNAUTHORIZED, error.message);
    }
    return true;
  }
}
