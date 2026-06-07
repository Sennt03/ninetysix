import { Role } from '../../../common/enums/role.enum';
import { UserEntity } from '../entities/user.entity';
export interface CreateUserData {
    email: string;
    username: string;
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
export declare abstract class UserRepository {
    abstract create(data: CreateUserData): Promise<UserEntity>;
    abstract findById(id: string): Promise<UserEntity | null>;
    abstract findByEmail(email: string): Promise<UserEntity | null>;
    abstract findAll(params: FindAllParams): Promise<UserEntity[]>;
    abstract count(): Promise<number>;
    abstract update(id: string, data: UpdateUserData): Promise<UserEntity | null>;
    abstract setRefreshTokenHash(id: string, hash: string | null): Promise<void>;
    abstract delete(id: string): Promise<boolean>;
}
