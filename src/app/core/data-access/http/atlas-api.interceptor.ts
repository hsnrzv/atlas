import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, catchError, retry, throwError, timer } from 'rxjs';
import { API_BASE_URL, ATLAS_HTTP_RETRY, isApiUrl } from './api-config';
import { toAtlasDataError } from './problem-details';

const IDEMPOTENT_METHODS = new Set(['GET', 'HEAD']);
/** No response, bad gateway, unavailable, gateway timeout: worth another try for a read. */
const TRANSIENT_STATUSES = new Set([0, 502, 503, 504]);

/**
 * The Atlas API client policy (F4-2, frontend.md §15) for requests under {@link API_BASE_URL}: asks for JSON,
 * retries idempotent reads after transient failures and turns every failure into an `AtlasDataError`, so stores
 * never see `HttpErrorResponse`. Writes are never retried here: a retry could repeat a non-idempotent change.
 */
export const atlasApiInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> => {
  if (!isApiUrl(request.url, inject(API_BASE_URL))) {
    return next(request);
  }
  const policy = inject(ATLAS_HTTP_RETRY);
  const prepared = request.headers.has('Accept')
    ? request
    : request.clone({ setHeaders: { Accept: 'application/json, application/problem+json' } });
  let response = next(prepared);
  if (IDEMPOTENT_METHODS.has(request.method) && policy.count > 0) {
    response = response.pipe(
      retry({
        count: policy.count,
        delay: (error: unknown, attempt: number) =>
          error instanceof HttpErrorResponse && TRANSIENT_STATUSES.has(error.status)
            ? timer(policy.delayMs * 2 ** (attempt - 1))
            : throwError(() => error),
      }),
    );
  }
  return response.pipe(
    catchError((error: unknown) =>
      throwError(() => (error instanceof HttpErrorResponse ? toAtlasDataError(error) : error)),
    ),
  );
};
