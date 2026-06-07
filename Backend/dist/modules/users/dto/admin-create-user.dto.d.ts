import { Role } from '../../../common/enums/role.enum';
import { CreateUserDto } from './create-user.dto';
export declare class AdminCreateUserDto extends CreateUserDto {
    roles?: Role[];
}
