import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { splitString } from 'src/utils/string.util';
import { accountRole } from 'src/commons/enum.common';
import { RedisCacheService } from '../caches/cache.service';
import { JWTService } from '../jwts/jwt.service';
import { AppHttpException } from '../exceptions/http.exceptions';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Inject(RedisCacheService)
    private cacheService: RedisCacheService,
    @Inject(JWTService)
    private jwtService: JWTService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requireRoles = this.reflector.getAllAndOverride<accountRole[]>(
      'roles',
      [context.getHandler(), context.getClass()],
    );
    const request = context.switchToHttp().getRequest();
    const token = request.get('Authorization');
    const sessionId = request.session.sid;
    if (!sessionId) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        'Your session is not vaid',
      );
    }
    if (!token) return false;
    const tokenParts = token.split(' ');
    if (tokenParts[0] !== 'Bearer') return false;
    try {
      const signature = splitString(tokenParts[1], '.', -1);
      const { username } = await this.jwtService.verifyToken(tokenParts[1]);
      if (requireRoles.length === 0) return true;
      const role = await this.cacheService.get(
        `users:${username}:${sessionId}:${signature}`,
      );
      if (!requireRoles.includes(role as accountRole)) return false;
    } catch {
      return false;
    }
    return true;
  }
}
