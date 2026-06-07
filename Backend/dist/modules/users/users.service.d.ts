import { ConfigService } from '@nestjs/config';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { Role } from '../../common/enums/role.enum';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';
import { AppConfig } from '../../config/configuration';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SafeUser, UserEntity } from './entities/user.entity';
import { UserRepository } from './repositories/user.repository';
export declare class UsersService {
    private readonly userRepository;
    private readonly configService;
    constructor(userRepository: UserRepository, configService: ConfigService<AppConfig, true>);
    create(dto: CreateUserDto, roles?: Role[]): Promise<UserEntity>;
    findByEmail(email: string): Promise<UserEntity | null>;
    findById(id: string): Promise<UserEntity | null>;
    findByIdOrFail(id: string): Promise<UserEntity>;
    getProfile(id: string): Promise<SafeUser>;
    findAll(pagination: PaginationDto): Promise<PaginatedResult<SafeUser>>;
    update(id: string, dto: UpdateUserDto): Promise<SafeUser>;
    remove(id: string): Promise<void>;
    setRefreshTokenHash(id: string, hash: string | null): Promise<void>;
}
