import { makeEnvironmentProviders, type EnvironmentProviders } from '@angular/core';
import { dataSourceProviders } from './data-source';
import { provideAtlasHttp } from './http/provide-atlas-http';

/** Registers the HTTP client and the repository ports with the adapter of this build (frontend.md §6.2). */
export function provideAtlasData(): EnvironmentProviders {
  return makeEnvironmentProviders([provideAtlasHttp(), dataSourceProviders()]);
}
