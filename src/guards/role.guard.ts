import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../commons/enum.common';
import { RedisCacheService } from '../modules/caches/cache.service';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private cacheService: RedisCacheService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    /**
     * get require role metadata from context
     */
    const requireRoles = await this.reflector.getAllAndOverride<Role[]>(
      'Roles',
      [context.getHandler(), context.getClass()],
    );
    if (!requireRoles) {
      return true;
    }
    /**
     * get user from request and check role
     */
    const username = request.user;
    const role = (await this.cacheService.get(`user:${username}:role`)) as Role;
    if (!requireRoles.includes(role)) {
      return false;
    }
    return true;
  }
}
