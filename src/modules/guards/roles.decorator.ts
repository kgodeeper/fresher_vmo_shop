import { SetMetadata } from '@nestjs/common';
import { accountRole } from '../../commons/enum.common';

export const Roles = (...roles: accountRole[]) => SetMetadata('roles', roles);
