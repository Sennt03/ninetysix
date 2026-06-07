import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { Role } from '../../common/enums/role.enum';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';
import { AppConfig } from '../../config/configuration';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SafeUser, UserEntity, toSafeUser } from './entities/user.entity';
import { UserRepository } from './repositories/user.repository';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly configService: ConfigService<AppConfig, true>,
  ) {}

  /** Crea un usuario (hashea la contraseña y valida unicidad de email). */
  async create(dto: CreateUserDto, roles: Role[] = [Role.USER]): Promise<UserEntity> {
    const existing = await this.userRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('El email ya está registrado');
    }
    const saltRounds = this.configService.get('bcryptSaltRounds', { infer: true });
    const password = await bcrypt.hash(dto.password, saltRounds);
    return this.userRepository.create({
      email: dto.email,
      username: dto.username,
      password,
      roles,
    });
  }

  findByEmail(email: string): Promise<UserEntity | null> {
    return this.userRepository.findByEmail(email);
  }

  findById(id: string): Promise<UserEntity | null> {
    return this.userRepository.findById(id);
  }

  async findByIdOrFail(id: string): Promise<UserEntity> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return user;
  }

  async getProfile(id: string): Promise<SafeUser> {
    return toSafeUser(await this.findByIdOrFail(id));
  }

  async findAll(pagination: PaginationDto): Promise<PaginatedResult<SafeUser>> {
    const { page, limit, skip } = pagination;
    const [items, total] = await Promise.all([
      this.userRepository.findAll({ skip, limit }),
      this.userRepository.count(),
    ]);
    return {
      items: items.map(toSafeUser),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) || 1 },
    };
  }

  async update(id: string, dto: UpdateUserDto): Promise<SafeUser> {
    if (dto.email) {
      const owner = await this.userRepository.findByEmail(dto.email);
      if (owner && owner.id !== id) {
        throw new ConflictException('El email ya está registrado');
      }
    }
    const updated = await this.userRepository.update(id, dto);
    if (!updated) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return toSafeUser(updated);
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.userRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException('Usuario no encontrado');
    }
  }

  setRefreshTokenHash(id: string, hash: string | null): Promise<void> {
    return this.userRepository.setRefreshTokenHash(id, hash);
  }
}
