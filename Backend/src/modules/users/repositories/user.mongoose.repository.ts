import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role } from '../../../common/enums/role.enum';
import { UserEntity } from '../entities/user.entity';
import { User, UserDocument } from '../schemas/user.schema';
import { CreateUserData, FindAllParams, UpdateUserData, UserRepository } from './user.repository';

@Injectable()
export class UserMongooseRepository implements UserRepository {
  constructor(@InjectModel(User.name) private readonly model: Model<UserDocument>) {}

  async create(data: CreateUserData): Promise<UserEntity> {
    const created = await this.model.create({
      email: data.email,
      username: data.username,
      password: data.password,
      roles: data.roles ?? [Role.USER],
    });
    return this.toEntity(created);
  }

  async findById(id: string): Promise<UserEntity | null> {
    const doc = await this.model.findById(id).exec();
    return doc ? this.toEntity(doc) : null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const doc = await this.model.findOne({ email }).exec();
    return doc ? this.toEntity(doc) : null;
  }

  async findAll({ skip, limit }: FindAllParams): Promise<UserEntity[]> {
    const docs = await this.model.find().sort({ createdAt: -1 }).skip(skip).limit(limit).exec();
    return docs.map((doc) => this.toEntity(doc));
  }

  count(): Promise<number> {
    return this.model.countDocuments().exec();
  }

  async update(id: string, data: UpdateUserData): Promise<UserEntity | null> {
    const doc = await this.model.findByIdAndUpdate(id, data, { new: true }).exec();
    return doc ? this.toEntity(doc) : null;
  }

  async setRefreshTokenHash(id: string, hash: string | null): Promise<void> {
    await this.model.findByIdAndUpdate(id, { refreshTokenHash: hash }).exec();
  }

  async delete(id: string): Promise<boolean> {
    const res = await this.model.deleteOne({ _id: id }).exec();
    return res.deletedCount > 0;
  }

  private toEntity(doc: UserDocument): UserEntity {
    return {
      id: String(doc._id),
      email: doc.email,
      username: doc.username,
      password: doc.password,
      roles: doc.roles,
      refreshTokenHash: doc.refreshTokenHash ?? null,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
