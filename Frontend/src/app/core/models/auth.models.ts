import { User } from './user.models';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

/** Lo que devuelve /auth/login, /auth/register y /auth/refresh. */
export interface AuthResult {
  user: User;
  tokens: AuthTokens;
}

/** Lo que persistimos en el almacenamiento local. */
export interface AuthSession {
  user: User;
  tokens: AuthTokens;
}
