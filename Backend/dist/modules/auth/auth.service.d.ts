import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AppConfig } from '../../config/configuration';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { AuthResult } from './interfaces/auth-result.interface';
export declare class AuthService {
    private readonly usersService;
    private readonly jwtService;
    private readonly configService;
    constructor(usersService: UsersService, jwtService: JwtService, configService: ConfigService<AppConfig, true>);
    register(dto: CreateUserDto): Promise<AuthResult>;
    login(dto: LoginDto): Promise<AuthResult>;
    refreshTokens(userId: string, refreshToken: string): Promise<AuthResult>;
    logout(userId: string): Promise<{
        success: boolean;
    }>;
    private validateCredentials;
    private buildAuthResult;
    private generateTokens;
    private get saltRounds();
}
