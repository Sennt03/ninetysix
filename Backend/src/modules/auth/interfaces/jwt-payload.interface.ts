import { Role } from '../../../common/enums/role.enum';

export interface JwtPayload {
  /** id del usuario */
  sub: string;
  email: string;
  roles: Role[];
}

/** Lo que la estrategia de refresh deja en `request.user`. */
export interface RefreshTokenPayload extends JwtPayload {
  refreshToken: string;
}
