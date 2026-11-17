import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { AtlasSession } from '../auth/atlas-session';
import { API_BASE_URL, isApiUrl } from './api-config';

/**
 * The 401 hook (F4-5): an API `401` tells {@link AtlasSession} that the session is gone; with the `auth` flag on it
 * sends the browser to sign in. Runs inside `atlasApiInterceptor`, so it still sees the HTTP status; `403` (signed in
 * but not allowed) is left to the error message. The error always reaches the caller.
 */
export const atlasAuthInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> => {
  if (!isApiUrl(request.url, inject(API_BASE_URL))) {
    return next(request);
  }
  const session = inject(AtlasSession);
  return next(request).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        session.unauthorized();
      }
      return throwError(() => error);
    }),
  );
};
