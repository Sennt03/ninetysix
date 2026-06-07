/**
 * Roles del sistema (RBAC). Los valores coinciden con el enum `Role`
 * generado por Prisma, de modo que el mapeo SQL <-> dominio es directo.
 */
export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
}
