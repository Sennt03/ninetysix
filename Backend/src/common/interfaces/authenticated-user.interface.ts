import { Role } from '../enums/role.enum';

/**
 * Forma del objeto que las estrategias JWT dejan en `request.user`.
 */
export interface AuthenticatedUser {
  id: string;
  email: string;
  username: string;
  roles: Role[];
}
