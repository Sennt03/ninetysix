import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@env/environment';
import { ApiResponse, PaginatedResult, ReorderItem } from '@models/api.models';
import {
  ProductDetail,
  ProductListItem,
  ProductPayload,
  ProductQuery,
} from '@models/product.models';
import { Observable, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.url_api}/admin/products`;

  list(query: ProductQuery): Observable<PaginatedResult<ProductListItem>> {
    let params = new HttpParams();
    if (query.page) params = params.set('page', query.page);
    if (query.limit) params = params.set('limit', query.limit);
    if (query.search) params = params.set('search', query.search);
    if (query.status?.length) params = params.set('status', query.status.join(','));
    if (query.categoryId) params = params.set('categoryId', query.categoryId);
    if (query.featured !== undefined) params = params.set('featured', query.featured);
    if (query.hasVariants !== undefined) params = params.set('hasVariants', query.hasVariants);
    return this.http
      .get<ApiResponse<PaginatedResult<ProductListItem>>>(this.url, { params })
      .pipe(map((r) => r.data));
  }

  get(id: string): Observable<ProductDetail> {
    return this.http.get<ApiResponse<ProductDetail>>(`${this.url}/${id}`).pipe(map((r) => r.data));
  }

  create(payload: ProductPayload): Observable<ProductDetail> {
    return this.http.post<ApiResponse<ProductDetail>>(this.url, payload).pipe(map((r) => r.data));
  }

  update(id: string, payload: ProductPayload): Observable<ProductDetail> {
    return this.http
      .put<ApiResponse<ProductDetail>>(`${this.url}/${id}`, payload)
      .pipe(map((r) => r.data));
  }

  remove(id: string): Observable<void> {
    return this.http.delete<ApiResponse<null>>(`${this.url}/${id}`).pipe(map(() => undefined));
  }

  duplicate(id: string): Observable<ProductDetail> {
    return this.http
      .post<ApiResponse<ProductDetail>>(`${this.url}/${id}/duplicate`, {})
      .pipe(map((r) => r.data));
  }

  reorder(items: ReorderItem[]): Observable<void> {
    return this.http
      .patch<ApiResponse<null>>(`${this.url}/reorder`, { items })
      .pipe(map(() => undefined));
  }
}
