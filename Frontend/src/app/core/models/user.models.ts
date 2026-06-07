export type Role = 'USER' | 'ADMIN';

export const ROLES: Role[] = ['USER', 'ADMIN'];

export interface User {
  id: string;
  email: string;
  username: string;
  roles: Role[];
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateUserPayload {
  username?: string;
  email?: string;
  roles?: Role[];
}

/** Alta de usuario por un ADMIN (POST /users). */
export interface CreateUserPayload {
  username: string;
  email: string;
  password: string;
  roles: Role[];
}
