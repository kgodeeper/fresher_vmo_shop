import { SetMetadata } from '@nestjs/common';
import { accountRole } from './enum.common';

export const Roles = (...roles: accountRole[]) => SetMetadata('roles', roles);
