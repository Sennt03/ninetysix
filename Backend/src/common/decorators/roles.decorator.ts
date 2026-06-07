import { SetMetadata } from '@nestjs/common';
import { Role } from '../enums/role.enum';

export const ROLES_KEY = 'roles';

/**
 * Restringe un endpoint a los roles indicados (lo aplica RolesGuard).
 * Uso: `@Roles(Role.ADMIN)`.
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
