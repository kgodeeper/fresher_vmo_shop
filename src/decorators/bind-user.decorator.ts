import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const UserBound = createParamDecorator(
  (data: unknown, context: ExecutionContext): string => {
    const request = context.switchToHttp().getRequest();
    return request.user;
  },
);
