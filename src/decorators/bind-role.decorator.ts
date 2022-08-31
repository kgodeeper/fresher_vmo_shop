import { SetMetadata } from '@nestjs/common';
import { Role } from '../commons/enum.common';

export function RequireRoles(...Roles: Role[]) {
  return SetMetadata('Roles', Roles);
}
