import { PaginationDto } from '../../common/dto/pagination.dto';
import { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { AdminCreateUserDto } from './dto/admin-create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getProfile(user: AuthenticatedUser): Promise<import("./entities/user.entity").SafeUser>;
    create(dto: AdminCreateUserDto): Promise<import("./entities/user.entity").SafeUser>;
    findAll(pagination: PaginationDto): Promise<import("../../common/interfaces/paginated-result.interface").PaginatedResult<import("./entities/user.entity").SafeUser>>;
    findOne(id: string): Promise<import("./entities/user.entity").SafeUser>;
    update(id: string, dto: UpdateUserDto): Promise<import("./entities/user.entity").SafeUser>;
    remove(id: string): Promise<void>;
}
