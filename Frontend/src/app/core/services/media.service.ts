import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@env/environment';
import { ApiResponse, PaginatedResult } from '@models/api.models';
import { MediaAsset, MediaAssetDetail, MediaQuery } from '@models/media.models';
import { Observable, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MediaService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.url_api}/admin/media`;

  list(query: MediaQuery = {}): Observable<PaginatedResult<MediaAsset>> {
    let params = new HttpParams();
    if (query.page) params = params.set('page', query.page);
    if (query.limit) params = params.set('limit', query.limit);
    if (query.search) params = params.set('search', query.search);
    if (query.usage && query.usage !== 'all') params = params.set('usage', query.usage);
    return this.http
      .get<ApiResponse<PaginatedResult<MediaAsset>>>(this.url, { params })
      .pipe(map((r) => r.data));
  }

  get(id: string): Observable<MediaAssetDetail> {
    return this.http
      .get<ApiResponse<MediaAssetDetail>>(`${this.url}/${id}`)
      .pipe(map((r) => r.data));
  }

  /** Sube uno o varios archivos a la biblioteca. */
  upload(files: File[]): Observable<MediaAsset[]> {
    const form = new FormData();
    for (const file of files) {
      form.append('files', file, file.name);
    }
    return this.http.post<ApiResponse<MediaAsset[]>>(this.url, form).pipe(map((r) => r.data));
  }

  remove(id: string): Observable<void> {
    return this.http.delete<ApiResponse<null>>(`${this.url}/${id}`).pipe(map(() => undefined));
  }
}
