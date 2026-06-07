import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { Strategy } from 'passport-jwt';
import { AppConfig } from '../../../config/configuration';
import { JwtPayload, RefreshTokenPayload } from '../interfaces/jwt-payload.interface';
declare const JwtRefreshStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtRefreshStrategy extends JwtRefreshStrategy_base {
    constructor(config: ConfigService<AppConfig, true>);
    validate(req: Request, payload: JwtPayload): RefreshTokenPayload;
}
export {};
