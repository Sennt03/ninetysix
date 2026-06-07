import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/** Activa la estrategia 'jwt-refresh' en el endpoint de renovación. */
@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwt-refresh') {}
