import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AppConfig } from '../../../config/configuration';
import { JwtPayload, RefreshTokenPayload } from '../interfaces/jwt-payload.interface';

/**
 * Valida el refresh token (firma + expiración) y adjunta el token en crudo
 * para que el service lo compare con el hash almacenado (rotación de tokens).
 */
@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(config: ConfigService<AppConfig, true>) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get('jwt.refreshSecret', { infer: true }),
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: JwtPayload): RefreshTokenPayload {
    const refreshToken = ExtractJwt.fromAuthHeaderAsBearerToken()(req) ?? '';
    return { ...payload, refreshToken };
  }
}
