import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@env/environment';
import { ApiResponse, ReorderItem } from '@models/api.models';
import {
  Category,
  CategoryPayload,
  CategoryStatus,
  DeleteCategoryOptions,
} from '@models/category.models';
import { Observable, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CategoriesService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.url_api}/admin/categories`;

  /** Árbol completo. */
  tree(): Observable<Category[]> {
    return this.http.get<ApiResponse<Category[]>>(this.url).pipe(map((r) => r.data));
  }

  /** Lista plana (con nombre del padre) y filtros opcionales. */
  flat(filters?: { status?: CategoryStatus; parentId?: string; search?: string }): Observable<
    Category[]
  > {
    let params = new HttpParams().set('flat', 'true');
    if (filters?.status) params = params.set('status', filters.status);
    if (filters?.parentId) params = params.set('parentId', filters.parentId);
    if (filters?.search) params = params.set('search', filters.search);
    return this.http.get<ApiResponse<Category[]>>(this.url, { params }).pipe(map((r) => r.data));
  }

  get(id: string): Observable<Category> {
    return this.http.get<ApiResponse<Category>>(`${this.url}/${id}`).pipe(map((r) => r.data));
  }

  create(payload: CategoryPayload): Observable<Category> {
    return this.http.post<ApiResponse<Category>>(this.url, payload).pipe(map((r) => r.data));
  }

  update(id: string, payload: CategoryPayload): Observable<Category> {
    return this.http
      .put<ApiResponse<Category>>(`${this.url}/${id}`, payload)
      .pipe(map((r) => r.data));
  }

  remove(id: string, opts?: DeleteCategoryOptions): Observable<void> {
    let params = new HttpParams();
    if (opts?.reassignChildrenTo) params = params.set('reassignChildrenTo', opts.reassignChildrenTo);
    if (opts?.reassignProductsTo) params = params.set('reassignProductsTo', opts.reassignProductsTo);
    return this.http
      .delete<ApiResponse<null>>(`${this.url}/${id}`, { params })
      .pipe(map(() => undefined));
  }

  reorder(items: ReorderItem[]): Observable<void> {
    return this.http
      .patch<ApiResponse<null>>(`${this.url}/reorder`, { items })
      .pipe(map(() => undefined));
  }
}
