import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { EMPTY, Observable, expand, map, reduce } from 'rxjs';
import { API_BASE_URL, apiUrl } from './api-config';

/** A paginated collection (API-CONTRACT §5). */
export interface Page<T> {
  readonly content: readonly T[];
  readonly page: {
    readonly size: number;
    readonly number: number;
    readonly totalElements: number;
    readonly totalPages: number;
  };
}

export type QueryValue = string | number | boolean | readonly (string | number | boolean)[];
export type Query = Readonly<Record<string, QueryValue | null | undefined>>;

export interface WriteOptions {
  /** The resource's `version`; sent as the strong `If-Match` ETag (API-CONTRACT §6). */
  readonly version?: number;
  /** Sent as `Idempotency-Key` on retry-safe creates (API-CONTRACT §7). */
  readonly idempotencyKey?: string;
  readonly query?: Query;
}

/** The largest page the contract allows; bounded collections fit in one or two pages. */
export const MAX_PAGE_SIZE = 100;

function params(query: Query | undefined): HttpParams {
  let result = new HttpParams();
  for (const [name, value] of Object.entries(query ?? {})) {
    if (value === null || value === undefined) {
      continue;
    }
    for (const item of Array.isArray(value) ? value : [value]) {
      result = result.append(name, String(item));
    }
  }
  return result;
}

function headers(options: WriteOptions): HttpHeaders {
  let result = new HttpHeaders();
  if (options.version !== undefined) {
    result = result.set('If-Match', `"${options.version}"`);
  }
  if (options.idempotencyKey !== undefined) {
    result = result.set('Idempotency-Key', options.idempotencyKey);
  }
  return result;
}

function isPage<T>(body: unknown): body is Page<T> {
  return typeof body === 'object' && body !== null && Array.isArray((body as Page<T>).content);
}

/**
 * Thin typed access to `/api/v1` for the HTTP adapters (F4-1). Paths are given as segments and URL-encoded. Errors
 * arrive as `AtlasDataError` through `atlasApiInterceptor`.
 */
@Injectable({ providedIn: 'root' })
export class AtlasApi {
  private readonly http = inject(HttpClient);
  private readonly base = inject(API_BASE_URL);

  url(...segments: readonly string[]): string {
    return apiUrl(this.base, ...segments);
  }

  get<T>(segments: readonly string[], query?: Query): Observable<T> {
    return this.http.get<T>(this.url(...segments), { params: params(query) });
  }

  /** Every item of a paginated collection, page by page. A plain array response is accepted as one page. */
  getAll<T>(segments: readonly string[], query?: Query): Observable<readonly T[]> {
    const pageAt = (number: number) =>
      this.get<Page<T> | readonly T[]>(segments, { ...query, page: number, size: MAX_PAGE_SIZE });
    return pageAt(0).pipe(
      expand((body) =>
        isPage<T>(body) && body.page.number + 1 < body.page.totalPages
          ? pageAt(body.page.number + 1)
          : EMPTY,
      ),
      map((body) => (isPage<T>(body) ? body.content : (body as readonly T[]))),
      reduce((all, items) => [...all, ...items], [] as readonly T[]),
    );
  }

  post<T>(segments: readonly string[], body: unknown, options: WriteOptions = {}): Observable<T> {
    return this.http.post<T>(this.url(...segments), body ?? null, {
      headers: headers(options),
      params: params(options.query),
    });
  }

  put<T>(segments: readonly string[], body: unknown, options: WriteOptions = {}): Observable<T> {
    return this.http.put<T>(this.url(...segments), body, {
      headers: headers(options),
      params: params(options.query),
    });
  }

  patch<T>(segments: readonly string[], body: unknown, options: WriteOptions = {}): Observable<T> {
    return this.http.patch<T>(this.url(...segments), body, {
      headers: headers(options),
      params: params(options.query),
    });
  }

  delete(segments: readonly string[], options: WriteOptions = {}): Observable<void> {
    return this.http
      .delete(this.url(...segments), { headers: headers(options), params: params(options.query) })
      .pipe(map(() => undefined));
  }
}
