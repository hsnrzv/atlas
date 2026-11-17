import {
  provideHttpClient,
  withFetch,
  withInterceptors,
  withXsrfConfiguration,
} from '@angular/common/http';
import type { EnvironmentProviders } from '@angular/core';
import { atlasApiInterceptor } from './atlas-api.interceptor';
import { atlasAuthInterceptor } from './atlas-auth.interceptor';

/**
 * The HTTP client for the Atlas API (F4-2, F4-5): `fetch` backend (same-origin, so the session cookie is sent),
 * XSRF cookie-to-header names matching Spring Security's `CookieCsrfTokenRepository`, the Atlas interceptor and,
 * inside it, the 401 hook.
 */
export function provideAtlasHttp(): EnvironmentProviders {
  return provideHttpClient(
    withFetch(),
    withXsrfConfiguration({ cookieName: 'XSRF-TOKEN', headerName: 'X-XSRF-TOKEN' }),
    withInterceptors([atlasApiInterceptor, atlasAuthInterceptor]),
  );
}
