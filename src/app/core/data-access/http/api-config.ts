import { InjectionToken } from '@angular/core';

/**
 * Base path of the Atlas API (API-CONTRACT §1). The edge proxy routes `/api/` to the backend on the same origin, and
 * the dev server proxies it (`proxy.conf.json`), so no host is configured.
 */
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
  providedIn: 'root',
  factory: () => '/api/v1',
});

/** Retries of idempotent reads after a transient failure (frontend.md §15): `count` tries with doubling delay. */
export interface HttpRetryPolicy {
  readonly count: number;
  readonly delayMs: number;
}

export const ATLAS_HTTP_RETRY = new InjectionToken<HttpRetryPolicy>('ATLAS_HTTP_RETRY', {
  providedIn: 'root',
  factory: () => ({ count: 2, delayMs: 500 }),
});

/** `base` plus path segments; each segment is URL-encoded, so an id can never change the path. */
export function apiUrl(base: string, ...segments: readonly string[]): string {
  return [base, ...segments.map((segment) => encodeURIComponent(segment))].join('/');
}

/** Whether `url` addresses the Atlas API, so the interceptor leaves other requests (assets, fonts) alone. */
export function isApiUrl(url: string, base: string): boolean {
  return url === base || url.startsWith(`${base}/`) || url.startsWith(`${base}?`);
}
