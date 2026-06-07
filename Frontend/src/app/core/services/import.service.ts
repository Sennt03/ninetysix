import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@env/environment';
import { ApiResponse, PaginatedResult } from '@models/api.models';
import {
  ImportColumn,
  ImportJob,
  ImportJobRow,
  ImportJobsQuery,
  ImportPreview,
  ImportRowsQuery,
} from '@models/import.models';
import { Observable, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ImportService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.url_api}/admin`;

  // ------------------------------ importar ------------------------------

  previewProducts(file: File): Observable<ImportPreview> {
    return this.preview('products', file);
  }

  previewCategories(file: File): Observable<ImportPreview> {
    return this.preview('categories', file);
  }

  importProducts(file: File): Observable<{ jobId: string }> {
    return this.startJob('products', file);
  }

  importCategories(file: File): Observable<{ jobId: string }> {
    return this.startJob('categories', file);
  }

  importImages(file: File): Observable<{ jobId: string }> {
    return this.startJob('images', file);
  }

  // ------------------------- historial / incidencias -------------------------

  history(query: ImportJobsQuery = {}): Observable<PaginatedResult<ImportJob>> {
    let params = new HttpParams();
    if (query.page) params = params.set('page', query.page);
    if (query.limit) params = params.set('limit', query.limit);
    if (query.type) params = params.set('type', query.type);
    if (query.search) params = params.set('search', query.search);
    return this.http
      .get<ApiResponse<PaginatedResult<ImportJob>>>(`${this.url}/import/jobs`, { params })
      .pipe(map((r) => r.data));
  }

  job(id: string): Observable<ImportJob> {
    return this.http
      .get<ApiResponse<ImportJob>>(`${this.url}/import/jobs/${id}`)
      .pipe(map((r) => r.data));
  }

  rows(id: string, query: ImportRowsQuery = {}): Observable<PaginatedResult<ImportJobRow>> {
    let params = new HttpParams();
    if (query.page) params = params.set('page', query.page);
    if (query.limit) params = params.set('limit', query.limit);
    if (query.status) params = params.set('status', query.status);
    return this.http
      .get<ApiResponse<PaginatedResult<ImportJobRow>>>(`${this.url}/import/jobs/${id}/rows`, {
        params,
      })
      .pipe(map((r) => r.data));
  }

  columns(type: 'products' | 'categories'): Observable<ImportColumn[]> {
    return this.http
      .get<ApiResponse<ImportColumn[]>>(`${this.url}/import/columns/${type}`)
      .pipe(map((r) => r.data));
  }

  // ------------------------------ descargas ------------------------------

  downloadErrors(id: string): Observable<Blob> {
    return this.blob(`${this.url}/import/jobs/${id}/errors.xlsx`);
  }

  downloadTemplate(type: 'products' | 'categories'): Observable<Blob> {
    return this.blob(`${this.url}/import/template/${type}.xlsx`);
  }

  exportProducts(params: Record<string, string>): Observable<Blob> {
    return this.blob(`${this.url}/export/products.xlsx`, params);
  }

  exportCategories(): Observable<Blob> {
    return this.blob(`${this.url}/export/categories.xlsx`);
  }

  // ------------------------------- internos -------------------------------

  private preview(type: 'products' | 'categories', file: File): Observable<ImportPreview> {
    const form = new FormData();
    form.append('file', file, file.name);
    return this.http
      .post<ApiResponse<ImportPreview>>(`${this.url}/import/${type}/preview`, form)
      .pipe(map((r) => r.data));
  }

  private startJob(
    type: 'products' | 'categories' | 'images',
    file: File,
  ): Observable<{ jobId: string }> {
    const form = new FormData();
    form.append('file', file, file.name);
    return this.http
      .post<ApiResponse<{ jobId: string }>>(`${this.url}/import/${type}`, form)
      .pipe(map((r) => r.data));
  }

  private blob(url: string, params?: Record<string, string>): Observable<Blob> {
    return this.http.get(url, { responseType: 'blob', params });
  }
}
