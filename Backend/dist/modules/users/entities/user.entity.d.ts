import { Role } from '../../../common/enums/role.enum';
export declare class UserEntity {
    id: string;
    email: string;
    username: string;
    password: string;
    roles: Role[];
    refreshTokenHash: string | null;
    createdAt: Date;
    updatedAt: Date;
}
export interface SafeUser {
    id: string;
    email: string;
    username: string;
    roles: Role[];
    createdAt: Date;
    updatedAt: Date;
}
export declare const toSafeUser: (user: UserEntity) => SafeUser;
