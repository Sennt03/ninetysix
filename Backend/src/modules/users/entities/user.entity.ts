import { Role } from '../../../common/enums/role.enum';

/**
 * Modelo de dominio del usuario. Es independiente del motor de BD:
 * cada repositorio (Mongoose/Prisma) mapea su documento/registro a esta forma.
 */
export class UserEntity {
  id: string;
  email: string;
  username: string;
  /** Hash bcrypt; nunca se devuelve al cliente. */
  password: string;
  roles: Role[];
  /** Hash del refresh token vigente (o null si no hay sesión). */
  refreshTokenHash: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/** Usuario seguro para exponer en respuestas (sin password ni tokens). */
export interface SafeUser {
  id: string;
  email: string;
  username: string;
  roles: Role[];
  createdAt: Date;
  updatedAt: Date;
}

export const toSafeUser = (user: UserEntity): SafeUser => ({
  id: user.id,
  email: user.email,
  username: user.username,
  roles: user.roles,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});
