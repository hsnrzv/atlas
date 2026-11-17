import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import type { EnvironmentProviders } from '@angular/core';
import { atlasApiInterceptor } from './atlas-api.interceptor';

/**
 * The HTTP client for the Atlas API (F4-2): `fetch` backend, Angular's default XSRF handling (`XSRF-TOKEN` cookie →
 * `X-XSRF-TOKEN` header, matching Spring's defaults) and the Atlas interceptor.
 */
export function provideAtlasHttp(): EnvironmentProviders {
  return provideHttpClient(withFetch(), withInterceptors([atlasApiInterceptor]));
}
