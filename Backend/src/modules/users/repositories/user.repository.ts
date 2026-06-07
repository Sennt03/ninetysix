import { Role } from '../../../common/enums/role.enum';
import { UserEntity } from '../entities/user.entity';

export interface CreateUserData {
  email: string;
  username: string;
  /** Ya debe venir hasheado. */
  password: string;
  roles?: Role[];
}

export interface UpdateUserData {
  email?: string;
  username?: string;
  roles?: Role[];
}

export interface FindAllParams {
  skip: number;
  limit: number;
}

/**
 * Contrato de persistencia de usuarios. Se usa como token de inyección
 * (clase abstracta) y tiene una implementación por motor:
 * `UserMongooseRepository` y `UserPrismaRepository`.
 *
 * Los services dependen SOLO de esta abstracción, nunca de Mongoose/Prisma.
 */
export abstract class UserRepository {
  abstract create(data: CreateUserData): Promise<UserEntity>;
  abstract findById(id: string): Promise<UserEntity | null>;
  abstract findByEmail(email: string): Promise<UserEntity | null>;
  abstract findAll(params: FindAllParams): Promise<UserEntity[]>;
  abstract count(): Promise<number>;
  abstract update(id: string, data: UpdateUserData): Promise<UserEntity | null>;
  abstract setRefreshTokenHash(id: string, hash: string | null): Promise<void>;
  abstract delete(id: string): Promise<boolean>;
}
