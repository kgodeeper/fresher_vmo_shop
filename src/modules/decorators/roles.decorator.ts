import { SetMetadata } from '@nestjs/common';
import { accountRole } from 'src/commons/enum.common';

export const Roles = (...roles: accountRole[]) => SetMetadata('roles', roles);
