import { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenPayload } from './interfaces/jwt-payload.interface';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(dto: LoginDto): Promise<import("./interfaces/auth-result.interface").AuthResult>;
    refresh(payload: RefreshTokenPayload): Promise<import("./interfaces/auth-result.interface").AuthResult>;
    logout(userId: string): Promise<{
        success: boolean;
    }>;
    me(user: AuthenticatedUser): AuthenticatedUser;
}
