import { Injectable } from '@nestjs/common';
import { User as PrismaUser } from '@prisma/client';
import { Role } from '../../../common/enums/role.enum';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { UserEntity } from '../entities/user.entity';
import { CreateUserData, FindAllParams, UpdateUserData, UserRepository } from './user.repository';

@Injectable()
export class UserPrismaRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateUserData): Promise<UserEntity> {
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        username: data.username,
        password: data.password,
        roles: this.serializeRoles(data.roles ?? [Role.USER]),
      },
    });
    return this.toEntity(user);
  }

  async findById(id: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user ? this.toEntity(user) : null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    return user ? this.toEntity(user) : null;
  }

  async findAll({ skip, limit }: FindAllParams): Promise<UserEntity[]> {
    const users = await this.prisma.user.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
    return users.map((u) => this.toEntity(u));
  }

  count(): Promise<number> {
    return this.prisma.user.count();
  }

  async update(id: string, data: UpdateUserData): Promise<UserEntity | null> {
    try {
      const user = await this.prisma.user.update({
        where: { id },
        data: {
          ...(data.email !== undefined && { email: data.email }),
          ...(data.username !== undefined && { username: data.username }),
          ...(data.roles !== undefined && { roles: this.serializeRoles(data.roles) }),
        },
      });
      return this.toEntity(user);
    } catch {
      return null; // registro no encontrado
    }
  }

  async setRefreshTokenHash(id: string, hash: string | null): Promise<void> {
    await this.prisma.user.update({ where: { id }, data: { refreshTokenHash: hash } });
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.user.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  private toEntity(user: PrismaUser): UserEntity {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      password: user.password,
      roles: this.parseRoles(user.roles),
      refreshTokenHash: user.refreshTokenHash,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  // En MySQL los roles se guardan como JSON string (p. ej. ["USER","ADMIN"]).
  private serializeRoles(roles: Role[]): string {
    return JSON.stringify(roles);
  }

  private parseRoles(raw: string): Role[] {
    try {
      const parsed: unknown = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length > 0 ? (parsed as Role[]) : [Role.USER];
    } catch {
      return [Role.USER];
    }
  }
}
