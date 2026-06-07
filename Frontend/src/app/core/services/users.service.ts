import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@env/environment';
import { ApiResponse, PaginatedResult } from '@models/api.models';
import { CreateUserPayload, UpdateUserPayload, User } from '@models/user.models';
import { Observable, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.url_api}/users`;

  /** Perfil del usuario autenticado. */
  getProfile(): Observable<User> {
    return this.http.get<ApiResponse<User>>(`${this.url}/me`).pipe(map((r) => r.data));
  }

  /** Listado paginado (solo ADMIN). */
  list(page = 1, limit = 10): Observable<PaginatedResult<User>> {
    const params = new HttpParams().set('page', page).set('limit', limit);
    return this.http
      .get<ApiResponse<PaginatedResult<User>>>(this.url, { params })
      .pipe(map((r) => r.data));
  }

  /** Alta de usuario con roles (solo ADMIN). */
  create(payload: CreateUserPayload): Observable<User> {
    return this.http.post<ApiResponse<User>>(this.url, payload).pipe(map((r) => r.data));
  }

  getById(id: string): Observable<User> {
    return this.http.get<ApiResponse<User>>(`${this.url}/${id}`).pipe(map((r) => r.data));
  }

  update(id: string, payload: UpdateUserPayload): Observable<User> {
    return this.http.patch<ApiResponse<User>>(`${this.url}/${id}`, payload).pipe(map((r) => r.data));
  }

  remove(id: string): Observable<void> {
    return this.http.delete<ApiResponse<null>>(`${this.url}/${id}`).pipe(map(() => undefined));
  }
}
