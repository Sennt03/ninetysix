import { Model } from 'mongoose';
import { UserEntity } from '../entities/user.entity';
import { UserDocument } from '../schemas/user.schema';
import { CreateUserData, FindAllParams, UpdateUserData, UserRepository } from './user.repository';
export declare class UserMongooseRepository implements UserRepository {
    private readonly model;
    constructor(model: Model<UserDocument>);
    create(data: CreateUserData): Promise<UserEntity>;
    findById(id: string): Promise<UserEntity | null>;
    findByEmail(email: string): Promise<UserEntity | null>;
    findAll({ skip, limit }: FindAllParams): Promise<UserEntity[]>;
    count(): Promise<number>;
    update(id: string, data: UpdateUserData): Promise<UserEntity | null>;
    setRefreshTokenHash(id: string, hash: string | null): Promise<void>;
    delete(id: string): Promise<boolean>;
    private toEntity;
}
