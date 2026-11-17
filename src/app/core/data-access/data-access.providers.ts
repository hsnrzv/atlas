import {
  inject,
  makeEnvironmentProviders,
  provideAppInitializer,
  type EnvironmentProviders,
} from '@angular/core';
import { AtlasSession } from './auth/atlas-session';
import { dataSourceProviders } from './data-source';
import { provideAtlasHttp } from './http/provide-atlas-http';

/**
 * Registers the HTTP client and the repository ports with the adapter of this build (frontend.md §6.2), and starts
 * the session bootstrap (F4-5) without holding up the first render.
 */
export function provideAtlasData(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideAtlasHttp(),
    dataSourceProviders(),
    provideAppInitializer(() => {
      void inject(AtlasSession).bootstrap();
    }),
  ]);
}
