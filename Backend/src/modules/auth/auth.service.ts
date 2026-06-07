import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AppConfig } from '../../config/configuration';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UserEntity, toSafeUser } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { AuthResult, AuthTokens } from './interfaces/auth-result.interface';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<AppConfig, true>,
  ) {}

  async register(dto: CreateUserDto): Promise<AuthResult> {
    const user = await this.usersService.create(dto);
    return this.buildAuthResult(user);
  }

  async login(dto: LoginDto): Promise<AuthResult> {
    const user = await this.validateCredentials(dto.email, dto.password);
    return this.buildAuthResult(user);
  }

  /** Rota los tokens validando el refresh token contra el hash guardado. */
  async refreshTokens(userId: string, refreshToken: string): Promise<AuthResult> {
    const user = await this.usersService.findById(userId);
    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException('Sesión inválida');
    }
    const matches = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!matches) {
      throw new UnauthorizedException('Sesión inválida');
    }
    return this.buildAuthResult(user);
  }

  /** Invalida el refresh token vigente. */
  async logout(userId: string): Promise<{ success: boolean }> {
    await this.usersService.setRefreshTokenHash(userId, null);
    return { success: true };
  }

  private async validateCredentials(email: string, password: string): Promise<UserEntity> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    return user;
  }

  private async buildAuthResult(user: UserEntity): Promise<AuthResult> {
    const tokens = await this.generateTokens(user);
    const refreshTokenHash = await bcrypt.hash(tokens.refreshToken, this.saltRounds);
    await this.usersService.setRefreshTokenHash(user.id, refreshTokenHash);
    return { user: toSafeUser(user), tokens };
  }

  private async generateTokens(user: UserEntity): Promise<AuthTokens> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roles: user.roles,
    };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('jwt.accessSecret', { infer: true }),
        expiresIn: this.configService.get('jwt.accessExpiresIn', { infer: true }),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('jwt.refreshSecret', { infer: true }),
        expiresIn: this.configService.get('jwt.refreshExpiresIn', { infer: true }),
      }),
    ]);
    return { accessToken, refreshToken };
  }

  private get saltRounds(): number {
    return this.configService.get('bcryptSaltRounds', { infer: true });
  }
}
