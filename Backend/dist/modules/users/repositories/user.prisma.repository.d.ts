import { PrismaService } from '../../../database/prisma/prisma.service';
import { UserEntity } from '../entities/user.entity';
import { CreateUserData, FindAllParams, UpdateUserData, UserRepository } from './user.repository';
export declare class UserPrismaRepository implements UserRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(data: CreateUserData): Promise<UserEntity>;
    findById(id: string): Promise<UserEntity | null>;
    findByEmail(email: string): Promise<UserEntity | null>;
    findAll({ skip, limit }: FindAllParams): Promise<UserEntity[]>;
    count(): Promise<number>;
    update(id: string, data: UpdateUserData): Promise<UserEntity | null>;
    setRefreshTokenHash(id: string, hash: string | null): Promise<void>;
    delete(id: string): Promise<boolean>;
    private toEntity;
    private serializeRoles;
    private parseRoles;
}
