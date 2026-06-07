import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { skipAuth } from '@core/interceptors/skip-auth.context';
import { environment } from '@env/environment';
import { ApiResponse } from '@models/api.models';
import { AuthResult, AuthSession, LoginRequest, RegisterRequest } from '@models/auth.models';
import { Role, User } from '@models/user.models';
import { Observable, tap } from 'rxjs';
import { StorageService } from './storage.service';

const SESSION_KEY = 'ninetysix.session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly storage = inject(StorageService);
  private readonly url = `${environment.url_api}/auth`;

  // --- Estado reactivo con signals ---
  private readonly _session = signal<AuthSession | null>(
    this.storage.get<AuthSession>(SESSION_KEY),
  );
  readonly session = this._session.asReadonly();
  readonly user = computed<User | null>(() => this._session()?.user ?? null);
  readonly roles = computed<Role[]>(() => this._session()?.user.roles ?? []);
  readonly isAuthenticated = computed<boolean>(() => this._session() !== null);
  readonly isAdmin = computed<boolean>(() => this.roles().includes('ADMIN'));

  login(data: LoginRequest): Observable<ApiResponse<AuthResult>> {
    return this.http
      .post<ApiResponse<AuthResult>>(`${this.url}/login`, data, { context: skipAuth() })
      .pipe(tap((res) => this.setSession(res.data)));
  }

  register(data: RegisterRequest): Observable<ApiResponse<AuthResult>> {
    return this.http
      .post<ApiResponse<AuthResult>>(`${this.url}/register`, data, { context: skipAuth() })
      .pipe(tap((res) => this.setSession(res.data)));
  }

  /** Renueva tokens enviando el refresh token como Bearer (sin pasar por los interceptores de auth). */
  refresh(): Observable<ApiResponse<AuthResult>> {
    return this.http
      .post<ApiResponse<AuthResult>>(
        `${this.url}/refresh`,
        {},
        {
          context: skipAuth(),
          headers: { Authorization: `Bearer ${this.refreshToken ?? ''}` },
        },
      )
      .pipe(tap((res) => this.setSession(res.data)));
  }

  logout(navigate = true): void {
    if (this._session()) {
      // best-effort: invalida el refresh token en el backend
      this.http.post(`${this.url}/logout`, {}).subscribe({ error: () => undefined });
    }
    this._session.set(null);
    this.storage.remove(SESSION_KEY);
    if (navigate) {
      this.router.navigate(['/auth/login']);
    }
  }

  hasRole(role: Role): boolean {
    return this.roles().includes(role);
  }

  updateUser(user: User): void {
    const current = this._session();
    if (!current) {
      return;
    }
    this.setSession({ user, tokens: current.tokens });
  }

  get accessToken(): string | null {
    return this._session()?.tokens.accessToken ?? null;
  }

  get refreshToken(): string | null {
    return this._session()?.tokens.refreshToken ?? null;
  }

  private setSession(session: AuthSession): void {
    this._session.set(session);
    this.storage.set(SESSION_KEY, session);
  }
}
